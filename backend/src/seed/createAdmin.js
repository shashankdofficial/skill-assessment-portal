require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    const password_hash = await bcrypt.hash(process.env.INIT_ADMIN_PASS || 'admin123', 10);
    const [admin, created] = await User.findOrCreate({ where: { email: process.env.INIT_ADMIN_EMAIL || 'admin@example.com' }, defaults: { name: 'Admin', password_hash, role: 'admin' } });
    console.log('Admin created or exists:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
