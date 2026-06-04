const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanyUser = sequelize.define('CompanyUser', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active'
  }
}, {
  timestamps: false,
  tableName: 'company_users'
});

module.exports = CompanyUser;
