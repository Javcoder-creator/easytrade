// src/config/logger.js
// Winston logger - professional logging tizimi

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, errors } = format;

// Log formati: vaqt + daraja + xabar
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat
  ),
  transports: [
    // Console ga chiqarish
    new transports.Console(),
    // Fayl ga yozish (xatoliklar)
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), errors({ stack: true }), logFormat)
    }),
    // Fayl ga yozish (hammasi)
    new transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), logFormat)
    })
  ]
});

module.exports = logger;
