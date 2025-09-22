#!/usr/bin/env node

const jwt = require('jsonwebtoken');

// Secret por defecto para desarrollo
const DEFAULT_SECRET = 'dev-secret-change-in-production';

function generateToken(secret = DEFAULT_SECRET, expiresIn = '1h') {
  const payload = {
    sub: 'test-user',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, secret, { expiresIn });
}

// Script CLI
if (require.main === module) {
  const secret = process.argv[2] || DEFAULT_SECRET;
  const expires = process.argv[3] || '1h';
  
  console.log('🔑 JWT Token Generator');
  console.log('====================');
  console.log(`Secret: ${secret}`);
  console.log(`Expires: ${expires}`);
  console.log('');
  
  const token = generateToken(secret, expires);
  console.log('Token:');
  console.log(token);
  console.log('');
  console.log('Usage:');
  console.log(`export JWT_TOKEN="${token}"`);
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/stats`);
}

module.exports = { generateToken };
