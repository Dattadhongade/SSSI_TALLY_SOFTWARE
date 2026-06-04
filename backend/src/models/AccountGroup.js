const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AccountGroup = sequelize.define('AccountGroup', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false }, // true for root groups like 'Current Assets'
}, { timestamps: true });

module.exports = AccountGroup;
