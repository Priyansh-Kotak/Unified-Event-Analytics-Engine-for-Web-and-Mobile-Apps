const crypto = require('crypto');

// Generate a secure API key
const generateApiKey = () => {
  // Generate a random string
  const randomString = crypto.randomBytes(32).toString('hex');
  
  // Create a prefix for easy identification
  const prefix = 'ak'; // analytics key
  
  // Combine prefix with random string
  return `${prefix}_${randomString}`;
};

// Validate API key format
const isValidApiKeyFormat = (apiKey) => {
  // Check if it starts with 'ak_' and has the correct length
  const pattern = /^ak_[a-f0-9]{64}$/;
  return pattern.test(apiKey);
};

module.exports = {
  generateApiKey,
  isValidApiKeyFormat
};