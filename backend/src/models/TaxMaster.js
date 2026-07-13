const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaxMaster = sequelize.define('TaxMaster', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  taxName: { type: DataTypes.STRING, allowNull: false }, // e.g., 'GST 18%', 'GST 5%'
  taxRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false }, // e.g., 18.00, 5.00
  cgstRate: { type: DataTypes.DECIMAL(5, 2) }, // e.g., 9.00
  sgstRate: { type: DataTypes.DECIMAL(5, 2) }, // e.g., 9.00
  igstRate: { type: DataTypes.DECIMAL(5, 2) }, // e.g., 18.00
  cessRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = TaxMaster;
