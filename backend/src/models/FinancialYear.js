const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancialYear = sequelize.define('FinancialYear', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'company_id'
  },
  yearName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'year_name'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_closed'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by'
  }
}, {
  timestamps: true,
  underscored: true
});

module.exports = FinancialYear;
