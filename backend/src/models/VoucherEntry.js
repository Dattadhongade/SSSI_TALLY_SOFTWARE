const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VoucherEntry = sequelize.define('VoucherEntry', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  debitAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  creditAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  taxableValue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  cgst: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  sgst: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  igst: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  cess: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  // Banking
  chequeNumber: { type: DataTypes.STRING },
  chequeDate: { type: DataTypes.DATEONLY },
  bankClearanceDate: { type: DataTypes.DATEONLY },
  // Cost Center Allocations (JSON array of { costCenterId, amount })
  costCenterAllocations: { type: DataTypes.TEXT },
}, { timestamps: true });

module.exports = VoucherEntry;
