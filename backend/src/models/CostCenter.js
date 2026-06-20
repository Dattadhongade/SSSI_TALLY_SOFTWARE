const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CostCenter = sequelize.define('CostCenter', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING, defaultValue: 'Primary Cost Category' },
  parentId: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.STRING }
}, { timestamps: true });

module.exports = CostCenter;
