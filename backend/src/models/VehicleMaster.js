const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VehicleMaster = sequelize.define('VehicleMaster', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vehicleNo: { type: DataTypes.STRING, allowNull: false, unique: true },
  vehicleType: { type: DataTypes.ENUM('Regular', 'Over Dimensional Cargo'), defaultValue: 'Regular' },
  mode: { type: DataTypes.ENUM('Road', 'Rail', 'Air', 'Ship'), defaultValue: 'Road' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = VehicleMaster;
