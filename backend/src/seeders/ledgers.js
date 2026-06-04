const { Ledger, Company, AccountGroup } = require('../models');

const seedLedgers = async () => {
  try {
    const defaultCompany = await Company.findOne({ order: [['id', 'ASC']] });
    const companyId = defaultCompany ? defaultCompany.id : null;

    if (!companyId) {
      console.log('No default company found, skipping Ledgers seed');
      return;
    }

    const ledgersData = [
      // Capital Account (1)
      { name: 'Owner Capital A/c', groupId: 1, balanceType: 'Cr' },
      { name: 'Partner Capital A/c', groupId: 1, balanceType: 'Cr' },
      { name: 'Drawings A/c', groupId: 1, balanceType: 'Dr' },
      { name: 'Share Capital A/c', groupId: 1, balanceType: 'Cr' },

      // Bank Accounts (12)
      { name: 'HDFC Bank', groupId: 12, balanceType: 'Dr' },
      { name: 'SBI Bank', groupId: 12, balanceType: 'Dr' },
      { name: 'ICICI Bank', groupId: 12, balanceType: 'Dr' },
      { name: 'Axis Bank', groupId: 12, balanceType: 'Dr' },
      { name: 'Kotak Bank', groupId: 12, balanceType: 'Dr' },
      { name: 'Current Account', groupId: 12, balanceType: 'Dr' },
      { name: 'Savings Account', groupId: 12, balanceType: 'Dr' },

      // Cash-in-Hand (13)
      { name: 'Cash', groupId: 13, balanceType: 'Dr' },

      // Deposits (Assets) (14)
      { name: 'Security Deposit', groupId: 14, balanceType: 'Dr' },
      { name: 'Electricity Deposit', groupId: 14, balanceType: 'Dr' },
      { name: 'Rent Deposit', groupId: 14, balanceType: 'Dr' },

      // Loans & Advances (Assets) (15)
      { name: 'Staff Advance', groupId: 15, balanceType: 'Dr' },
      { name: 'Vendor Advance', groupId: 15, balanceType: 'Dr' },
      { name: 'Advance Tax', groupId: 15, balanceType: 'Dr' },

      // Sundry Debtors (16)
      { name: 'ABC Traders', groupId: 16, balanceType: 'Dr' },
      { name: 'XYZ Pvt Ltd', groupId: 16, balanceType: 'Dr' },
      { name: 'Customer A', groupId: 16, balanceType: 'Dr' },

      // Duties & Taxes (18)
      // Base GST Payable
      { name: 'CGST Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'SGST Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'IGST Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'GST TDS Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'GST Interest Payable', groupId: 18, balanceType: 'Cr' },
      
      // Input GST Ledgers
      { name: 'Input CGST', groupId: 18, balanceType: 'Dr' },
      { name: 'Input SGST', groupId: 18, balanceType: 'Dr' },
      { name: 'Input IGST', groupId: 18, balanceType: 'Dr' },
      { name: 'Input CGST 2.5%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input SGST 2.5%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input IGST 5%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input CGST 9%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input SGST 9%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input IGST 18%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input CGST 20%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input SGST 20%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input IGST 40%', groupId: 18, balanceType: 'Dr' },
      { name: 'Input Cess', groupId: 18, balanceType: 'Dr' },

      // Output GST Ledgers
      { name: 'Output CGST', groupId: 18, balanceType: 'Cr' },
      { name: 'Output SGST', groupId: 18, balanceType: 'Cr' },
      { name: 'Output IGST', groupId: 18, balanceType: 'Cr' },
      { name: 'Output CGST 2.5%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output SGST 2.5%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output IGST 5%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output CGST 9%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output SGST 9%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output IGST 18%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output CGST 20%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output SGST 20%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output IGST 40%', groupId: 18, balanceType: 'Cr' },
      { name: 'Output Cess', groupId: 18, balanceType: 'Cr' },

      // RCM GST
      { name: 'RCM CGST Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'RCM SGST Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'RCM IGST Payable', groupId: 18, balanceType: 'Cr' },

      // TDS/TCS
      { name: 'TDS Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'TCS Payable', groupId: 18, balanceType: 'Cr' },
      { name: 'Professional Tax Payable', groupId: 18, balanceType: 'Cr' },

      // Sundry Creditors (19)
      { name: 'Supplier A', groupId: 19, balanceType: 'Cr' },
      { name: 'Supplier B', groupId: 19, balanceType: 'Cr' },
      { name: 'Vendor X', groupId: 19, balanceType: 'Cr' },

      // Provisions (20)
      { name: 'Audit Fees Payable', groupId: 20, balanceType: 'Cr' },
      { name: 'Salary Payable', groupId: 20, balanceType: 'Cr' },

      // Bank OD A/c (21)
      { name: 'Cash Credit Account', groupId: 21, balanceType: 'Cr' },
      { name: 'Overdraft Account', groupId: 21, balanceType: 'Cr' },

      // Secured Loans (22)
      { name: 'Vehicle Loan', groupId: 22, balanceType: 'Cr' },
      { name: 'Home Loan', groupId: 22, balanceType: 'Cr' },
      { name: 'Machinery Loan', groupId: 22, balanceType: 'Cr' },

      // Unsecured Loans (23)
      { name: 'Director Loan', groupId: 23, balanceType: 'Cr' },
      { name: 'Partner Loan', groupId: 23, balanceType: 'Cr' },
      { name: 'Friend Loan', groupId: 23, balanceType: 'Cr' },

      // Fixed Assets (5)
      { name: 'Furniture', groupId: 5, balanceType: 'Dr' },
      { name: 'Computer', groupId: 5, balanceType: 'Dr' },
      { name: 'Laptop', groupId: 5, balanceType: 'Dr' },
      { name: 'Printer', groupId: 5, balanceType: 'Dr' },
      { name: 'Office Equipment', groupId: 5, balanceType: 'Dr' },
      { name: 'Building', groupId: 5, balanceType: 'Dr' },
      { name: 'Land', groupId: 5, balanceType: 'Dr' },
      { name: 'Vehicle', groupId: 5, balanceType: 'Dr' },
      { name: 'Machinery', groupId: 5, balanceType: 'Dr' },

      // Sales Accounts (6)
      { name: 'Local Sales', groupId: 6, balanceType: 'Cr' },
      { name: 'Interstate Sales', groupId: 6, balanceType: 'Cr' },
      { name: 'Export Sales', groupId: 6, balanceType: 'Cr' },
      { name: 'GST Sales 5%', groupId: 6, balanceType: 'Cr' },
      { name: 'GST Sales 12%', groupId: 6, balanceType: 'Cr' },
      { name: 'GST Sales 18%', groupId: 6, balanceType: 'Cr' },
      { name: 'GST Sales 28%', groupId: 6, balanceType: 'Cr' },

      // Direct Income (7)
      { name: 'Job Work Income', groupId: 7, balanceType: 'Cr' },
      { name: 'Service Income', groupId: 7, balanceType: 'Cr' },
      { name: 'Manufacturing Income', groupId: 7, balanceType: 'Cr' },

      // Indirect Income (8)
      { name: 'Commission Received', groupId: 8, balanceType: 'Cr' },
      { name: 'Interest Received', groupId: 8, balanceType: 'Cr' },
      { name: 'Discount Received', groupId: 8, balanceType: 'Cr' },
      { name: 'Rent Received', groupId: 8, balanceType: 'Cr' },

      // Purchase Accounts (9)
      { name: 'Local Purchase', groupId: 9, balanceType: 'Dr' },
      { name: 'Interstate Purchase', groupId: 9, balanceType: 'Dr' },
      { name: 'Import Purchase', groupId: 9, balanceType: 'Dr' },
      { name: 'GST Purchase 5%', groupId: 9, balanceType: 'Dr' },
      { name: 'GST Purchase 12%', groupId: 9, balanceType: 'Dr' },
      { name: 'GST Purchase 18%', groupId: 9, balanceType: 'Dr' },
      { name: 'GST Purchase 28%', groupId: 9, balanceType: 'Dr' },

      // Direct Expenses (10)
      { name: 'Freight Inward', groupId: 10, balanceType: 'Dr' },
      { name: 'Loading Charges', groupId: 10, balanceType: 'Dr' },
      { name: 'Factory Rent', groupId: 10, balanceType: 'Dr' },
      { name: 'Wages', groupId: 10, balanceType: 'Dr' },
      { name: 'Packing Charges', groupId: 10, balanceType: 'Dr' },

      // Indirect Expenses (11)
      { name: 'Salary', groupId: 11, balanceType: 'Dr' },
      { name: 'Internet Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Telephone Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Electricity Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Rent Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Travelling Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Advertisement Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Office Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Printing & Stationery', groupId: 11, balanceType: 'Dr' },
      { name: 'Professional Fees', groupId: 11, balanceType: 'Dr' },
      { name: 'Audit Fees', groupId: 11, balanceType: 'Dr' },
      { name: 'Bank Charges', groupId: 11, balanceType: 'Dr' },
      { name: 'Insurance Expense', groupId: 11, balanceType: 'Dr' },
      { name: 'Depreciation', groupId: 11, balanceType: 'Dr' },
    ];

    for (const l of ledgersData) {
      await Ledger.findOrCreate({
        where: { name: l.name, companyId },
        defaults: { ...l, companyId }
      });
    }

    console.log('\x1b[32m%s\x1b[0m', '✓ Default Ledgers Seeded');
  } catch (error) {
    console.error('Error seeding Ledgers:', error);
  }
};

module.exports = seedLedgers;
