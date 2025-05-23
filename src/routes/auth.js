const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const userSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional(),
  country: z.enum(['INDIA', 'AMERICA']).optional()
});

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 
});

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

router.post('/signup', async (req, res) => {
  console.log('📝 Signup request received:', { body: { ...req.body, password: '[REDACTED]' } });
  
  try {
    const data = userSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || 'MEMBER',
        country: data.country || 'INDIA'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true
      }
    });

    const token = generateToken(user);

    res.cookie('token', token, getCookieOptions());

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error in signup process:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error instanceof z.ZodError) {
      console.log('📋 Validation error details:', error.errors);
      return res.status(400).json({ message: error.errors[0].message });
    }
    if (error.code === 'P2002') {
      console.log('📧 Duplicate email error');
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('🔥 Unexpected error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = userSchema.pick({ email: true, password: true }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        country: true,
        name: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);
    res.cookie('token', token, getCookieOptions());

    res.json({ user: userWithoutPassword });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/signout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });
  res.json({ message: 'Signed out successfully' });
});

module.exports = router; 