const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoucherInventory = sequelize.define('VoucherInventory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantity: { type: DataTypes.DECIMAL(15, 4), defaultValue: 0 },
  rate: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
}, { timestamps: true });

module.exports = VoucherInventory;
