const http = require('http');

http.get('http://localhost:5000/api/ledgers', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', () => {});
  res.on('end', () => console.log('Done'));
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
