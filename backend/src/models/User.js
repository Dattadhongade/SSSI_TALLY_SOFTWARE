const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mobile: {
    type: DataTypes.STRING,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active' // Active, Inactive
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'User', // Admin, User, etc.
  }
}, {
  timestamps: true,
  underscored: true // Use created_at, updated_at
});

module.exports = User;
