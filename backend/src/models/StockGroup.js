const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockGroup = sequelize.define('StockGroup', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
}, { timestamps: true });

module.exports = StockGroup;
