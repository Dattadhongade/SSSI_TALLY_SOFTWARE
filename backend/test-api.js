require('dotenv').config();
const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Failed with status ${res.statusCode}: ${data}`));
        } else {
          resolve(`Success ${path}: ${data.substring(0, 50)}...`);
        }
      });
    });
    req.on('error', error => reject(error));
    req.end();
  });
}

async function runTests() {
  const endpoints = ['/api/ledgers', '/api/stockitems', '/api/units', '/api/vouchers', '/api/vouchers/types'];
  for (const ep of endpoints) {
    try {
      console.log(await testEndpoint(ep));
    } catch(err) {
      console.error(`Error on ${ep}:`, err.message);
    }
  }
}

runTests();
