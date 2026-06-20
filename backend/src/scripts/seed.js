require('dotenv').config();
const { sequelize, User, Company, CompanyUser, FinancialYear, AccountGroup, Ledger, Unit, StockGroup, StockItem, Voucher, VoucherEntry, VoucherInventory } = require('../models');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Sync models
    console.log('Syncing database...');
    await sequelize.sync({ force: true }); // WARNING: This clears the DB
    console.log('Database cleared and synced.');

    // 1. Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password_hash: hashedPassword
    });
    console.log('User created: admin@demo.com / password123');

    // 2. Create Company
    const company = await Company.create({
      name: 'Demo Enterprises Ltd',
      gstin: '27AABCT1234E1Z1',
      state: 'Maharashtra',
      address: '123 Business Park, Pune',
      financialYearStart: new Date('2026-04-01'),
      booksBeginningFrom: new Date('2026-04-01')
    });
    await CompanyUser.create({ userId: user.id, companyId: company.id, role: 'Admin' });
    console.log('Company created');

    // 3. Create Financial Year
    const fy = await FinancialYear.create({
      companyId: company.id,
      yearName: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      createdBy: user.id
    });

    const commonKeys = {
      companyId: company.id,
      financialYearId: fy.id,
      userId: user.id
    };

    // 4. Create Account Groups
    const revenueGroup = await AccountGroup.create({ name: 'Sales Accounts', isRevenue: true, ...commonKeys });
    const expenseGroup = await AccountGroup.create({ name: 'Purchase Accounts', isRevenue: true, ...commonKeys });
    const debtorGroup = await AccountGroup.create({ name: 'Sundry Debtors', isRevenue: false, ...commonKeys });
    const creditorGroup = await AccountGroup.create({ name: 'Sundry Creditors', isRevenue: false, ...commonKeys });
    const cashGroup = await AccountGroup.create({ name: 'Cash-in-Hand', isRevenue: false, ...commonKeys });

    // 5. Create Ledgers
    const cashLedger = await Ledger.create({ name: 'Cash', groupId: cashGroup.id, openingBalance: 50000, openingBalanceType: 'Dr', ...commonKeys });
    const salesLedger = await Ledger.create({ name: 'Local Sales (18%)', groupId: revenueGroup.id, ...commonKeys });
    const purchaseLedger = await Ledger.create({ name: 'Local Purchase (18%)', groupId: expenseGroup.id, ...commonKeys });
    const customerLedger = await Ledger.create({ name: 'Shree Ganesh Enterprises', groupId: debtorGroup.id, state: 'Maharashtra', gstin: '27XYZABC1234D1Z5', registrationType: 'Regular', ...commonKeys });
    const supplierLedger = await Ledger.create({ name: 'Reliance Industries', groupId: creditorGroup.id, state: 'Maharashtra', gstin: '27RELIANCE1234D', registrationType: 'Regular', ...commonKeys });

    console.log('Ledgers created');

    // 6. Inventory Masters
    const unit = await Unit.create({ symbol: 'NOS', formalName: 'Numbers', ...commonKeys });
    const stockGroup = await StockGroup.create({ name: 'Electronics', ...commonKeys });
    const item = await StockItem.create({ 
      name: 'Smart TV 55 Inch', 
      stockGroupId: stockGroup.id, 
      unitId: unit.id, 
      taxability: 'Taxable',
      igstRate: 18,
      cgstRate: 9,
      sgstRate: 9,
      ...commonKeys 
    });

    console.log('Inventory created');

    // 7. Create Vouchers (Sales & Purchase)
    // Sales Voucher
    const salesVoucher = await Voucher.create({
      voucherNumber: 'SAL-001',
      date: new Date('2026-06-01'),
      ...commonKeys
    });

    // Sales Accounting Entries (Dr Customer 11800, Cr Sales 10000, Cr CGST 900, Cr SGST 900)
    await VoucherEntry.create({ voucherId: salesVoucher.id, ledgerId: customerLedger.id, debitAmount: 11800, creditAmount: 0 });
    await VoucherEntry.create({ voucherId: salesVoucher.id, ledgerId: salesLedger.id, debitAmount: 0, creditAmount: 10000 });
    // Assuming we had tax ledgers, omitting for simplicity, or adding dummy:
    const cgstLedger = await Ledger.create({ name: 'CGST', groupId: expenseGroup.id, ...commonKeys });
    const sgstLedger = await Ledger.create({ name: 'SGST', groupId: expenseGroup.id, ...commonKeys });
    await VoucherEntry.create({ voucherId: salesVoucher.id, ledgerId: cgstLedger.id, debitAmount: 0, creditAmount: 900 });
    await VoucherEntry.create({ voucherId: salesVoucher.id, ledgerId: sgstLedger.id, debitAmount: 0, creditAmount: 900 });

    // Sales Inventory Entry
    await VoucherInventory.create({
      voucherId: salesVoucher.id,
      stockItemId: item.id,
      billedQuantity: 1,
      rate: 10000,
      amount: 10000
    });

    console.log('Vouchers created');

    console.log('--- SEEDING COMPLETE ---');
    console.log('Login credentials:');
    console.log('Email: admin@demo.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
