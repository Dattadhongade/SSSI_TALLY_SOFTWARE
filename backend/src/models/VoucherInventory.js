const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoucherInventory = sequelize.define('VoucherInventory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantity: { type: DataTypes.DECIMAL(15, 4), defaultValue: 0 },
  rate: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  hsnSac: { type: DataTypes.STRING },
  gstRate: { type: DataTypes.DECIMAL(5, 2) },
  taxableValue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  igstRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  cgstRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  sgstRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  igstAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  cgstAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  sgstAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
}, { timestamps: true });

module.exports = VoucherInventory;
