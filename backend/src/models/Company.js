const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  mailingName: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  state: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING, defaultValue: 'India' },
  pincode: { type: DataTypes.STRING },
  telephone: { type: DataTypes.STRING },
  mobile: { type: DataTypes.STRING },
  fax: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  website: { type: DataTypes.STRING },
  baseCurrencySymbol: { type: DataTypes.STRING, defaultValue: '₹' },
  formalName: { type: DataTypes.STRING, defaultValue: 'INR' },
  financialYearStart: { type: DataTypes.DATEONLY, allowNull: false },
  booksBeginningFrom: { type: DataTypes.DATEONLY, allowNull: false },
  gstin: { type: DataTypes.STRING },
  pan: { type: DataTypes.STRING },
  tan: { type: DataTypes.STRING },
  cin: { type: DataTypes.STRING },
  // New fields for Logo and GST Details
  logo: { type: DataTypes.TEXT('long') }, // Base64 or URL
  gstRegistrationStatus: { type: DataTypes.STRING, defaultValue: 'Active' },
  gstRegistrationType: { type: DataTypes.STRING, defaultValue: 'Regular' },
  assesseeOtherTerritory: { type: DataTypes.BOOLEAN, defaultValue: false },
  periodicityGSTR1: { type: DataTypes.STRING, defaultValue: 'Monthly' },
  ewayBillApplicable: { type: DataTypes.BOOLEAN, defaultValue: true },
  ewayBillApplicableFrom: { type: DataTypes.DATEONLY },
  ewayBillIntrastate: { type: DataTypes.BOOLEAN, defaultValue: true },
  einvoicingApplicable: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = Company;
