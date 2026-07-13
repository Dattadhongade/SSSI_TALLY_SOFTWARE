const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HSNMaster = sequelize.define('HSNMaster', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  hsnCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = HSNMaster;
