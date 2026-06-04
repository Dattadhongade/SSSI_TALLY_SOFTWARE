require('dotenv').config();
const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/companies',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Body:', data);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
