// src/middleware/auth.js
// JWT token tekshirish middleware

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { error } = require('../utils/response');

// Asosiy autentifikatsiya middleware
const authenticate = (req, res, next) => {
  try {
    // Token ni Authorization headerdan olish
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Token topilmadi. Iltimos login qiling.', 401);
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>" -> "<token>"

    // Tokenni tekshirish
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Foydalanuvchi ma'lumotini so'rovga qo'shish
    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token muddati tugagan. Qayta login qiling.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Noto\'g\'ri token.', 401);
    }
    return error(res, 'Autentifikatsiyada xato.', 500);
  }
};

// Rol tekshirish middleware (RBAC)
// Foydalanish: authorize('admin', 'manager')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Avval login qiling.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(res, `Bu amalni bajarish uchun ruxsat yo'q. Talab: ${roles.join(' yoki ')}`, 403);
    }

    next();
  };
};

module.exports = { authenticate, authorize };
