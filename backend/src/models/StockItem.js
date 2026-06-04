const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockItem = sequelize.define('StockItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  hsnSac: { type: DataTypes.STRING },
  gstRate: { type: DataTypes.DECIMAL(5, 2) }, // e.g., 18.00
  openingQuantity: { type: DataTypes.DECIMAL(15, 4), defaultValue: 0 },
  openingRate: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  openingValue: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
}, { timestamps: true });

module.exports = StockItem;
