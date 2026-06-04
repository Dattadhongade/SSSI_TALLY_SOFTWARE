const { Sequelize } = require('sequelize');
// Better to just rely on server.js calling dotenv.config() early, but we can do it here for safety.

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Set to true to see SQL queries in the console
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('\x1b[32m%s\x1b[0m', '✓ MySQL Database Connected successfully.');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectDB };
