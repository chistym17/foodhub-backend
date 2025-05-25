const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

// Schema for payment processing
const processPaymentSchema = z.object({
  orderId: z.number(),
  paymentMethodId: z.number(),
  amount: z.number().positive()
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        paymentMethod: true,
        order: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Process a payment
router.post('/', async (req, res) => {
  try {
    const { orderId, paymentMethodId, amount } = processPaymentSchema.parse(req.body);

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment) {
      return res.status(400).json({ error: 'Order already has a payment' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: 'Order is not in pending status' });
    }

    // Verify payment method exists
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId }
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // Create payment and update order status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          orderId,
          paymentMethodId,
          amount,
          status: 'COMPLETED', // For demo purposes, always succeed
          errorMessage: null
        },
        include: {
          paymentMethod: true
        }
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }
      });

      return payment;
    });

    res.json(result);
  } catch (error) {
    console.error('Error processing payment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router; 