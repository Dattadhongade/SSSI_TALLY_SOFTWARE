const { sequelize } = require('../config/database');

const User = require('./User');
const Company = require('./Company');
const CompanyUser = require('./CompanyUser');
const FinancialYear = require('./FinancialYear');
const AccountGroup = require('./AccountGroup');
const Ledger = require('./Ledger');
const Unit = require('./Unit');
const Currency = require('./Currency');
const StockGroup = require('./StockGroup');
const StockItem = require('./StockItem');
const VoucherType = require('./VoucherType');
const Voucher = require('./Voucher');
const VoucherEntry = require('./VoucherEntry');
const VoucherInventory = require('./VoucherInventory');
const CostCenter = require('./CostCenter');
const Employee = require('./Employee');
const Payhead = require('./Payhead');

const TaxMaster = require('./TaxMaster');
const HSNMaster = require('./HSNMaster');
const Transporter = require('./Transporter');
const VehicleMaster = require('./VehicleMaster');
const EInvoice = require('./EInvoice');
const EwayBill = require('./EwayBill');

// --- Associations ---

// Many-to-Many: Users <-> Companies
User.belongsToMany(Company, { through: CompanyUser, foreignKey: 'user_id' });
Company.belongsToMany(User, { through: CompanyUser, foreignKey: 'company_id' });

// Financial Years
Company.hasMany(FinancialYear, { foreignKey: 'company_id' });
FinancialYear.belongsTo(Company, { foreignKey: 'company_id' });

User.hasMany(FinancialYear, { foreignKey: 'created_by' });
FinancialYear.belongsTo(User, { foreignKey: 'created_by' });

// Function to add common foreign keys
const addCommonFKs = (Model) => {
  Company.hasMany(Model, { foreignKey: 'companyId' });
  Model.belongsTo(Company, { foreignKey: 'companyId' });

  FinancialYear.hasMany(Model, { foreignKey: 'financialYearId' });
  Model.belongsTo(FinancialYear, { foreignKey: 'financialYearId' });

  User.hasMany(Model, { foreignKey: 'userId' });
  Model.belongsTo(User, { foreignKey: 'userId' });
};

// Apply common FKs to masters and transactions
const tables = [AccountGroup, Ledger, Unit, Currency, StockGroup, StockItem, VoucherType, Voucher, VoucherEntry, VoucherInventory, CostCenter, Employee, Payhead, TaxMaster, HSNMaster, Transporter, VehicleMaster, EInvoice, EwayBill];
tables.forEach(addCommonFKs);

// AccountGroup Hierarchy
AccountGroup.hasMany(AccountGroup, { as: 'children', foreignKey: 'parentGroupId' });
AccountGroup.belongsTo(AccountGroup, { as: 'parent', foreignKey: 'parentGroupId' });

// Ledger to Group
AccountGroup.hasMany(Ledger, { foreignKey: 'groupId' });
Ledger.belongsTo(AccountGroup, { foreignKey: 'groupId' });

// StockGroup Hierarchy
StockGroup.hasMany(StockGroup, { as: 'children', foreignKey: 'parentGroupId' });
StockGroup.belongsTo(StockGroup, { as: 'parent', foreignKey: 'parentGroupId' });

// StockItem Associations
StockGroup.hasMany(StockItem, { foreignKey: 'stockGroupId' });
StockItem.belongsTo(StockGroup, { foreignKey: 'stockGroupId' });

Unit.hasMany(StockItem, { foreignKey: 'unitId' });
StockItem.belongsTo(Unit, { foreignKey: 'unitId' });

// Voucher Associations
VoucherType.hasMany(Voucher, { foreignKey: 'voucherTypeId' });
Voucher.belongsTo(VoucherType, { foreignKey: 'voucherTypeId' });

// Voucher Entries (Accounting lines)
Voucher.hasMany(VoucherEntry, { as: 'entries', foreignKey: 'voucherId' });
VoucherEntry.belongsTo(Voucher, { foreignKey: 'voucherId' });

Ledger.hasMany(VoucherEntry, { foreignKey: 'ledgerId' });
VoucherEntry.belongsTo(Ledger, { foreignKey: 'ledgerId' });

// Voucher Inventory (Stock lines)
Voucher.hasMany(VoucherInventory, { as: 'inventoryEntries', foreignKey: 'voucherId' });
VoucherInventory.belongsTo(Voucher, { foreignKey: 'voucherId' });

StockItem.hasMany(VoucherInventory, { foreignKey: 'stockItemId' });
VoucherInventory.belongsTo(StockItem, { foreignKey: 'stockItemId' });

// E-Invoice & E-Way Bill
Voucher.hasOne(EInvoice, { foreignKey: 'voucherId' });
EInvoice.belongsTo(Voucher, { foreignKey: 'voucherId' });

Voucher.hasOne(EwayBill, { foreignKey: 'voucherId' });
EwayBill.belongsTo(Voucher, { foreignKey: 'voucherId' });

module.exports = {
  sequelize,
  User,
  Company,
  CompanyUser,
  FinancialYear,
  AccountGroup,
  Ledger,
  Unit,
  Currency,
  StockGroup,
  StockItem,
  VoucherType,
  Voucher,
  VoucherEntry,
  VoucherInventory,
  CostCenter,
  Employee,
  Payhead,
  TaxMaster,
  HSNMaster,
  Transporter,
  VehicleMaster,
  EInvoice,
  EwayBill
};
