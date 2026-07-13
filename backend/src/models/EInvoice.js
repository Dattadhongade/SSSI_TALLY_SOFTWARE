const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EInvoice = sequelize.define('EInvoice', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  voucherId: { type: DataTypes.INTEGER, allowNull: false },
  irn: { type: DataTypes.STRING(64), unique: true },
  ackNo: { type: DataTypes.STRING(20) },
  ackDate: { type: DataTypes.DATE },
  signedQRCode: { type: DataTypes.TEXT },
  signedInvoice: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('Generated', 'Cancelled', 'Failed'), defaultValue: 'Generated' },
  cancelReason: { type: DataTypes.STRING },
  cancelDate: { type: DataTypes.DATE }
}, { timestamps: true });

module.exports = EInvoice;
