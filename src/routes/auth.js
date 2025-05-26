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

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const options = {
    httpOnly: true,
    secure: true, 
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  };

  return options;
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      country: user.country
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only administrators can access this resource' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/signup', async (req, res) => {
  
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
  // Use the same cookie options for consistency
  res.clearCookie('token', getCookieOptions());
  res.json({ message: 'Signed out successfully' });
});

// Add a test route to check cookie settings
router.get('/cookie-test', (req, res) => {
  const cookieOptions = getCookieOptions();
  console.log('Cookie options:', cookieOptions); // For debugging
  
  res.cookie('test_cookie', 'test_value', cookieOptions);
  res.json({ 
    message: 'Test cookie set',
    cookieOptions,
    environment: process.env.NODE_ENV,
    cookieDomain: process.env.COOKIE_DOMAIN
  });
});

// Get all users (admin only)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        _count: {
          select: {
            orders: true,
            payments: true
          }
        }
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router; 