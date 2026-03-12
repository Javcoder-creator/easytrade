// src/routes/auth.js
const router = require('express').Router();
const Joi = require('joi');
const { login, refresh, getMe, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Login validatsiyasi
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'To\'g\'ri email kiriting',
    'any.required': 'Email majburiy',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Parol kamida 6 belgi bo\'lishi kerak',
    'any.required': 'Parol majburiy',
  }),
});

router.post('/login',   validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout',  authenticate, logout);
router.get('/me',       authenticate, getMe);

module.exports = router;
