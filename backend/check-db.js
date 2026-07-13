require('dotenv').config();
const db = require('./src/models');
async function check() {
  try {
    const [results] = await db.sequelize.query('DESCRIBE Ledgers');
    console.log(results.map(r => r.Field));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
