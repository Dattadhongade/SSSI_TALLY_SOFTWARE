const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Voucher = sequelize.define('Voucher', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  voucherNumber: { type: DataTypes.STRING, allowNull: false },
  referenceNumber: { type: DataTypes.STRING },
  referenceDate: { type: DataTypes.DATEONLY },
  narration: { type: DataTypes.TEXT },
  totalAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
}, { timestamps: true });

module.exports = Voucher;
