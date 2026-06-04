const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Unit = sequelize.define('Unit', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.STRING, defaultValue: 'Simple' },
  symbol: { type: DataTypes.STRING, allowNull: false },
  formalName: { type: DataTypes.STRING },
  uqc: { type: DataTypes.STRING },
  numberOfDecimalPlaces: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

module.exports = Unit;
