// src/middleware/errorHandler.js
// Global xato ushlash middleware

const log = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  log.error(err.message, { url: req.url, method: req.method });

  // PostgreSQL xatolari
  if (err.code === '23505') { // unique violation
    return res.status(409).json({ success: false, message: 'Bu ma\'lumot allaqachon mavjud.' });
  }
  if (err.code === '23503') { // foreign key violation
    return res.status(400).json({ success: false, message: 'Bog\'liq ma\'lumot topilmadi.' });
  }

  // Umumiy xato
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Server xatosi yuz berdi' 
    : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
