// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT || 3306,
//     dialect: 'mysql',
//     logging: false,
//     pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
//   }
// );

// module.exports = sequelize;


// backend/src/config/db.js
// const path = require('path');
// const { Sequelize } = require('sequelize');

// // Load backend/.env explicitly (robust when starting from project root)
// require('dotenv').config({ path: path.resolve(__dirname, '..', '..', 'backend', '.env') });
// // If your .env is at backend/.env relative to project root, above will work.
// // If your repo layout differs, use: path.resolve(__dirname, '../.env') or similar.

// const DB_NAME = process.env.DB_NAME || 'skill_portal';
// const DB_USER = process.env.DB_USER || 'root';
// // Support both names for compatibility
// const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DB_PASS || '';
// const DB_HOST = process.env.DB_HOST === 'localhost' ? '127.0.0.1' : (process.env.DB_HOST || '127.0.0.1');
// const DB_PORT = Number(process.env.DB_PORT || 3306);

// const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
//   host: DB_HOST,
//   port: DB_PORT,
//   dialect: 'mysql',
//   logging: false,
//   pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
// });

// module.exports = sequelize;

// backend/src/config/db.js
const path = require('path');
const { Sequelize } = require('sequelize');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Use DATABASE_URL if deployed (Render, Railway, etc.) OR fallback to .env variables for local use
let sequelize;

if (process.env.DATABASE_URL) {
  // Example DATABASE_URL: mysql://user:password@host:3306/dbname
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    },
  });
  console.log('🌐 Connected via DATABASE_URL (MySQL)');
} else {
  // Local MySQL connection
  const DB_NAME = process.env.DB_NAME || 'skill_portal';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASS = process.env.DB_PASS || process.env.DB_PASSWORD || '';
  const DB_HOST = process.env.DB_HOST || '127.0.0.1';
  const DB_PORT = process.env.DB_PORT || 3306;

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });
  console.log('🏠 Connected via local MySQL');
}

module.exports = sequelize;

