// src/config/jwt.js
require('dotenv').config();

module.exports = {
  secret:         process.env.JWT_SECRET         || 'dev_secret_key',
  refreshSecret:  process.env.JWT_REFRESH_SECRET || 'dev_refresh_key',
  expiresIn:      process.env.JWT_EXPIRES_IN     || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
