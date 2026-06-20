const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Voucher = sequelize.define('Voucher', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  voucherNumber: { type: DataTypes.STRING, allowNull: false },
  narration: { type: DataTypes.TEXT },
  totalAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  // GST & Compliance
  placeOfSupply: { type: DataTypes.STRING },
  isReverseCharge: { type: DataTypes.BOOLEAN, defaultValue: false },
  // JSON Blobs
  dispatchDetails: { type: DataTypes.TEXT },
  partyDetails: { type: DataTypes.TEXT },
}, { timestamps: true });

module.exports = Voucher;
