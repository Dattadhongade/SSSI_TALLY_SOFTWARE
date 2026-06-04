const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Currency = sequelize.define('Currency', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  symbol: { type: DataTypes.STRING, allowNull: false },
  formalName: { type: DataTypes.STRING },
  isoCode: { type: DataTypes.STRING },
  decimalPlaces: { type: DataTypes.INTEGER, defaultValue: 2 },
  showInMillions: { type: DataTypes.BOOLEAN, defaultValue: false },
  suffixSymbol: { type: DataTypes.BOOLEAN, defaultValue: false },
  spaceBeforeSymbol: { type: DataTypes.BOOLEAN, defaultValue: false },
  wordForDecimal: { type: DataTypes.STRING },
  decimalPlacesForWords: { type: DataTypes.INTEGER, defaultValue: 2 }
}, { timestamps: true });

module.exports = Currency;
