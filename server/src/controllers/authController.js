// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');
const { success, error } = require('../utils/response');

// POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Foydalanuvchini topish
    const user = await User.findByEmail(email);
    if (!user) {
      return error(res, 'Email yoki parol noto\'g\'ri', 401);
    }

    // 2. Parolni tekshirish
    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return error(res, 'Email yoki parol noto\'g\'ri', 401);
    }

    // 3. JWT tokenlar yaratish
    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };

    const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
    const refreshToken = jwt.sign({ id: user.id }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });

    // 4. Javob qaytarish (password_hash ni qo'shmaslik)
    return success(res, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    }, 'Xush kelibsiz, ' + user.name + '!');

  } catch (err) {
    console.error('Login xato:', err);
    return error(res, 'Tizimga kirishda xato yuz berdi', 500);
  }
};

// POST /api/v1/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Refresh token topilmadi', 401);

    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    const user = await User.findById(decoded.id);
    if (!user) return error(res, 'Foydalanuvchi topilmadi', 401);

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    return success(res, { accessToken }, 'Token yangilandi');

  } catch (err) {
    return error(res, 'Token noto\'g\'ri yoki muddati tugagan', 401);
  }
};

// GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'Foydalanuvchi topilmadi', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Xato yuz berdi', 500);
  }
};

// POST /api/v1/auth/logout
const logout = async (req, res) => {
  // Client tokenni o'zi o'chiradi
  // Redis ga refresh tokenni qo'shish mumkin (blacklist)
  return success(res, null, 'Tizimdan chiqildi');
};

module.exports = { login, refresh, getMe, logout };
