// src/config/jwt.js — dotenv app.js da chaqiriladi
const isDev = process.env.NODE_ENV === 'development';
const secret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!secret && !isDev) {
  console.warn('JWT_SECRET muhim. .env da o\'rnating.');
}
if (!refreshSecret && !isDev) {
  console.warn('JWT_REFRESH_SECRET muhim. .env da o\'rnating.');
}

module.exports = {
  secret:         secret || (isDev ? 'dev_secret_key' : ''),
  refreshSecret:  refreshSecret || (isDev ? 'dev_refresh_key' : ''),
  expiresIn:      process.env.JWT_EXPIRES_IN     || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
