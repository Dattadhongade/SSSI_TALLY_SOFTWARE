const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoucherEntry = sequelize.define('VoucherEntry', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  debitAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  creditAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
}, { timestamps: true });

module.exports = VoucherEntry;
