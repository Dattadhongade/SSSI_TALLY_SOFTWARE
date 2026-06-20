const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payhead = sequelize.define('Payhead', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
  payheadType: { type: DataTypes.STRING, defaultValue: 'Earnings for Employees' }, // Earnings, Deductions, Statutory etc
  calculationType: { type: DataTypes.STRING, defaultValue: 'As Computed Value' }, // Flat Rate, On Attendance, As Computed Value
  computationInfo: { type: DataTypes.TEXT }, // JSON for formula details
}, { timestamps: true });

module.exports = Payhead;
