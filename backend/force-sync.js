require('dotenv').config();
const db = require('./src/models');

async function syncDb() {
  try {
    console.log('Force syncing database...');
    await db.sequelize.sync({ force: true });
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to sync DB:', err);
    process.exit(1);
  }
}
syncDb();
