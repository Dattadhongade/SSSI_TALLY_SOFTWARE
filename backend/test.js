require('dotenv').config();
const { getCompanies } = require('./src/controllers/companyController');

const req = { user: { id: 1 } };
const res = { 
  json: (data) => console.log('SUCCESS:', data),
  status: (code) => ({
    json: (data) => console.log('ERROR:', code, data)
  })
};

getCompanies(req, res).then(() => process.exit(0)).catch(e => {
  console.error('Uncaught', e);
  process.exit(1);
});
