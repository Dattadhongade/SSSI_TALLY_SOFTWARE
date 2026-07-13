const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transporter = sequelize.define('Transporter', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  transporterId: { type: DataTypes.STRING }, // Transporter ID / GSTIN
  contactPerson: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = Transporter;
