const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    cookies: req.cookies,
    headers: req.headers
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

module.exports = app; 