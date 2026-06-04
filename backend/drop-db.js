require('dotenv').config();
const mysql = require('mysql2/promise');

async function dropAndCreateDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    
    console.log(`Dropping database ${process.env.DB_NAME}...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;`);
    
    console.log(`Creating database ${process.env.DB_NAME}...`);
    await connection.query(`CREATE DATABASE \`${process.env.DB_NAME}\`;`);
    
    await connection.end();
    console.log('Database dropped and recreated successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
dropAndCreateDB();
