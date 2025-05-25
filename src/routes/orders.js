const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient();

const orderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().int().positive()
});

const createOrderSchema = z.object({
  userId: z.number(),
  items: z.array(orderItemSchema).min(1)
});

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

module.exports = router; 