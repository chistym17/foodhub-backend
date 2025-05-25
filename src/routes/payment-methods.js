const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Schema for payment method validation
const paymentMethodSchema = z.object({
  userId: z.number(),
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL']),
  details: z.string().min(1)
});

// Schema for updating payment method
const updatePaymentMethodSchema = z.object({
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL']).optional(),
  details: z.string().min(1).optional()
});

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Only administrators can manage payment methods' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all payment methods (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paidAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Get payment methods for a specific user (admin only)
router.get('/user/:userId', isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      include: {
        payments: {
          select: {
            id: true,
            amount: true,
            paidAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching user payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch user payment methods' });
  }
});

// Add a new payment method (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { userId, type, details } = paymentMethodSchema.parse(req.body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        details
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(paymentMethod);
  } catch (error) {
    console.error('Error creating payment method:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid payment method data' });
    }
    res.status(500).json({ error: 'Failed to create payment method' });
  }
});

// Update a payment method (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const paymentMethodId = parseInt(req.params.id);
    if (isNaN(paymentMethodId)) {
      return res.status(400).json({ error: 'Invalid payment method ID' });
    }

    const updateData = updatePaymentMethodSchema.parse(req.body);

    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: {
        payments: true
      }
    });

    if (!existingPaymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // Check if payment method has any payments
    if (existingPaymentMethod.payments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot update payment method with existing payments' 
      });
    }

    // Update payment method
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedPaymentMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid update data' });
    }
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// Delete a payment method (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const paymentMethodId = parseInt(req.params.id);
    if (isNaN(paymentMethodId)) {
      return res.status(400).json({ error: 'Invalid payment method ID' });
    }

    // Check if payment method exists and has any payments
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: {
        payments: true
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    if (paymentMethod.payments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete payment method with existing payments' 
      });
    }

    // Delete payment method
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId }
    });

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

module.exports = router; 