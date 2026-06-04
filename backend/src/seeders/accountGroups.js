const { AccountGroup } = require('../models');

const seedAccountGroups = async () => {
  try {
    // 1. Primary Groups
    const primaryGroups = [
      { id: 1, name: 'Capital Account', isPrimary: true },
      { id: 2, name: 'Current Assets', isPrimary: true },
      { id: 3, name: 'Current Liabilities', isPrimary: true },
      { id: 4, name: 'Loans (Liability)', isPrimary: true },
      { id: 5, name: 'Fixed Assets', isPrimary: true },
      { id: 6, name: 'Sales Accounts', isPrimary: true },
      { id: 7, name: 'Direct Income', isPrimary: true },
      { id: 8, name: 'Indirect Income', isPrimary: true },
      { id: 9, name: 'Purchase Accounts', isPrimary: true },
      { id: 10, name: 'Direct Expenses', isPrimary: true },
      { id: 11, name: 'Indirect Expenses', isPrimary: true },
    ];

    for (const group of primaryGroups) {
      await AccountGroup.findOrCreate({ where: { id: group.id }, defaults: group });
    }

    // 2. Sub-Groups
    const subGroups = [
      // Under Current Assets (2)
      { id: 12, name: 'Bank Accounts', parentGroupId: 2, isPrimary: false },
      { id: 13, name: 'Cash-in-Hand', parentGroupId: 2, isPrimary: false },
      { id: 14, name: 'Deposits (Assets)', parentGroupId: 2, isPrimary: false },
      { id: 15, name: 'Loans & Advances (Assets)', parentGroupId: 2, isPrimary: false },
      { id: 16, name: 'Sundry Debtors', parentGroupId: 2, isPrimary: false },
      { id: 17, name: 'Stock-in-Hand', parentGroupId: 2, isPrimary: false },
      
      // Under Current Liabilities (3)
      { id: 18, name: 'Duties & Taxes', parentGroupId: 3, isPrimary: false },
      { id: 19, name: 'Sundry Creditors', parentGroupId: 3, isPrimary: false },
      { id: 20, name: 'Provisions', parentGroupId: 3, isPrimary: false },

      // Under Loans (Liability) (4)
      { id: 21, name: 'Bank OD A/c', parentGroupId: 4, isPrimary: false },
      { id: 22, name: 'Secured Loans', parentGroupId: 4, isPrimary: false },
      { id: 23, name: 'Unsecured Loans', parentGroupId: 4, isPrimary: false },
    ];

    for (const group of subGroups) {
      await AccountGroup.findOrCreate({ where: { id: group.id }, defaults: group });
    }

    console.log('\x1b[32m%s\x1b[0m', '✓ Account Groups Seeded');
  } catch (error) {
    console.error('Error seeding Account Groups:', error);
  }
};

module.exports = seedAccountGroups;
