const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ledger = sequelize.define('Ledger', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING },
  openingBalance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  balanceType: { type: DataTypes.ENUM('Dr', 'Cr'), defaultValue: 'Dr' }, // Debit or Credit
  // Mailing Details
  mailingName: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  state: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  pincode: { type: DataTypes.STRING },
  // Banking Details
  provideBankDetails: { type: DataTypes.BOOLEAN, defaultValue: false },
  bankAccountHolder: { type: DataTypes.STRING },
  bankName: { type: DataTypes.STRING },
  bankAccountNumber: { type: DataTypes.STRING },
  bankIfsc: { type: DataTypes.STRING },
  // Tax Registration
  pan: { type: DataTypes.STRING },
  registrationType: { type: DataTypes.STRING },
  gstin: { type: DataTypes.STRING },
}, { timestamps: true });

module.exports = Ledger;
