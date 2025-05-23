const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');

const countrySchema = z.enum(['INDIA', 'AMERICA']);

router.get('/by-country/:country', async (req, res) => {
  try {
    const country = countrySchema.parse(req.params.country.toUpperCase());

    const restaurants = await prisma.restaurant.findMany({
      where: {
        country: country
      },
      select: {
        id: true,
        name: true,
        country: true
      }
    });

    res.json(restaurants);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid country parameter. Must be either INDIA or AMERICA' 
      });
    }
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:restaurantId/menu', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    if (isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurantId
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true
      }
    });

    res.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        country: restaurant.country
      },
      menuItems
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 