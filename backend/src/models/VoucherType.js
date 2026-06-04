const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoucherType = sequelize.define('VoucherType', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }, // e.g., 'Sales', 'Purchase', 'Receipt'
  typeOfVoucher: { type: DataTypes.STRING, allowNull: false }, // System recognized type
  methodOfVoucherNumbering: { 
    type: DataTypes.ENUM('Automatic', 'Manual', 'None'), 
    defaultValue: 'Automatic' 
  },
  prefix: { type: DataTypes.STRING }, // e.g., 'SSSI/2026-27/'
  suffix: { type: DataTypes.STRING }, 
  startingNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { timestamps: true });

module.exports = VoucherType;
