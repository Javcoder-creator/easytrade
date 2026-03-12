// src/app.js — Asosiy server fayli
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./config/database');
const routes       = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Xavfsizlik ───────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Juda ko\'p so\'rov. 15 daqiqadan so\'ng urinib ko\'ring.' },
});
app.use('/api', limiter);

// ─── Middleware ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Routes ───────────────────────────────────────────
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '✅ EasyTrade server ishlayapti',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route topilmadi: ${req.method} ${req.url}` });
});

// Global error handler
app.use(errorHandler);

// ─── Serverni ishga tushirish ─────────────────────────
async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ====================================');
    console.log(`🛒  EasyTrade Server ishga tushdi!`);
    console.log(`🌐  Port: ${PORT}`);
    console.log(`⚙️   Rejim: ${process.env.NODE_ENV || 'development'}`);
    console.log('🚀 ====================================');
    console.log('');
  });
}

startServer();
module.exports = app;
