const validator = require('validator');

const validatePhone = (phone) => {
  const phoneDigits = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?\d{10,15}$/.test(phoneDigits);
};

const validateEmail = (email) => {
  return validator.isEmail(email);
};

module.exports = {
  validatePhone,
  validateEmail
};