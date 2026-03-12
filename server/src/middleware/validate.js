// src/middleware/validate.js
// Joi validation middleware - request body tekshirish

const { error } = require('../utils/response');

// schema - Joi schema obyekti
const validate = (schema) => {
  return (req, res, next) => {
    const { error: validationError } = schema.validate(req.body, {
      abortEarly: false,    // Barcha xatolarni ko'rsatish (birinchisida to'xtatmaslik)
      stripUnknown: true,   // Noma'lum maydonlarni olib tashlash
    });

    if (validationError) {
      const errors = validationError.details.map(d => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return error(res, 'Kiritilgan ma\'lumotlar noto\'g\'ri', 422, errors);
    }

    next();
  };
};

module.exports = validate;
