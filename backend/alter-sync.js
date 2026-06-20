require('dotenv').config();
const db = require('./src/models');

async function alterDb() {
  try {
    console.log('Altering database...');
    await db.sequelize.sync({ alter: true });
    console.log('Database altered successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to alter DB:', err);
    process.exit(1);
  }
}
alterDb();
