const bcrypt = require('bcrypt');
const { User } = require('../src/models');
const { sequelize } = require('../src/config/database');

async function createAdmin() {
  try {
    // Authenticate and sync just to be sure
    await sequelize.authenticate();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create user
    const user = await User.findOrCreate({
      where: { email: 'admin@sssi.com' },
      defaults: {
        username: 'Admin',
        password: hashedPassword,
        role: 'Admin',
      }
    });

    if (user[1]) {
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('⚠️ Admin user already exists!');
    }
    
    console.log('\n--- LOGIN CREDENTIALS ---');
    console.log('Email: admin@sssi.com');
    console.log('Password: admin123');
    console.log('-------------------------\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exit(1);
  }
}

createAdmin();
