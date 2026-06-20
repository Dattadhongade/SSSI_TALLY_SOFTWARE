const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
  groupId: { type: DataTypes.INTEGER, allowNull: true },
  designation: { type: DataTypes.STRING },
  dateOfJoin: { type: DataTypes.DATEONLY },
  dateOfResign: { type: DataTypes.DATEONLY },
  bloodGroup: { type: DataTypes.STRING },
  panNumber: { type: DataTypes.STRING },
  aadhaarNumber: { type: DataTypes.STRING },
  uanNumber: { type: DataTypes.STRING },
  pfAccountNumber: { type: DataTypes.STRING },
  esiNumber: { type: DataTypes.STRING },
  bankDetails: { type: DataTypes.TEXT }, // JSON
  basicSalary: { type: DataTypes.DECIMAL(15, 2) },
}, { timestamps: true });

module.exports = Employee;
