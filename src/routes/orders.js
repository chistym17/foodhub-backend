const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const orderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().int().positive()
});

const createOrderSchema = z.object({
  userId: z.number(),
  items: z.array(orderItemSchema).min(1)
});

// Schema for updating order status
const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'])
});

// Middleware to check if user is admin or manager
const isAdminOrManager = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN' && decoded.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Forbidden: Only admins and managers can perform this action' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', async (req, res) => {
  try {
    const { userId, items } = createOrderSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let totalAmount = 0;
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${item.menuItemId} not found` });
      }

      totalAmount += menuItem.price * item.quantity;
    }

    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount
        }
      });

      await tx.orderItem.createMany({
        data: items.map(item => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity
        }))
      });

      return order;
    });

    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid order data' });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    const orders = await prisma.order.findMany({
      where: status ? { status: status.toUpperCase() } : undefined,
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        payment: {
          include: {
            paymentMethod: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/my-orders/:userId', async (req, res) => {
  try {
    // Get userId from the authenticated user
    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        payment: {
          include: {
            paymentMethod: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Update order status
router.patch('/:orderId/status', isAdminOrManager, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { status } = updateOrderStatusSchema.parse(req.body);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        payment: {
          include: {
            paymentMethod: true
          }
        }
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order
router.delete('/:orderId', isAdminOrManager, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order has payment
    if (order.payment) {
      return res.status(400).json({ error: 'Cannot delete order with payment' });
    }

    // Delete order items first (due to foreign key constraint)
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Delete the order
    await prisma.order.delete({
      where: { id: orderId }
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router; 