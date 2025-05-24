const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const prisma = new PrismaClient();

const orderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().min(1)
});

const createOrderSchema = z.object({
  userId: z.number(),
  items: z.array(orderItemSchema).min(1)
});

router.post('/', async (req, res) => {
  try {
    const { userId, items } = createOrderSchema.parse(req.body);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          items: {
            create: items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity
            }))
          }
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      });

      return newOrder;
    });

    const totalAmount = order.items.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);

    res.status(201).json({
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price,
          subtotal: item.menuItem.price * item.quantity
        })),
        totalAmount
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid order data',
        errors: error.errors 
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: 'Invalid menu item ID or user ID' 
      });
    }

    res.status(500).json({ 
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 