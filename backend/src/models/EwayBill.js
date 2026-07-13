const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EwayBill = sequelize.define('EwayBill', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  voucherId: { type: DataTypes.INTEGER, allowNull: false },
  ewayBillNo: { type: DataTypes.STRING(20), unique: true },
  validUpto: { type: DataTypes.DATE },
  generatedDate: { type: DataTypes.DATE },
  vehicleNo: { type: DataTypes.STRING },
  transporterId: { type: DataTypes.STRING },
  distance: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('Active', 'Cancelled', 'Extended'), defaultValue: 'Active' },
  cancelReason: { type: DataTypes.STRING }
}, { timestamps: true });

module.exports = EwayBill;
