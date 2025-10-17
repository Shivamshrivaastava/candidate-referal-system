const { randomUUID } = require('crypto');

const generateId = () => {
  return randomUUID();
};

module.exports = generateId;