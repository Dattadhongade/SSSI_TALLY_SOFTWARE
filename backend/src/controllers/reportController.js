const { Ledger, AccountGroup, VoucherEntry, Voucher, sequelize } = require('../models');

exports.getFinancialReports = async (req, res) => {
  try {
    // 1. Fetch all ledgers with their closing balance calculated from VoucherEntries
    const ledgers = await Ledger.findAll({
      include: [
        { model: AccountGroup, attributes: ['id', 'name', 'isRevenue', 'parentGroupId'] }
      ]
    });

    const entries = await VoucherEntry.findAll({
      attributes: [
        'ledgerId',
        [sequelize.fn('sum', sequelize.col('debitAmount')), 'totalDebit'],
        [sequelize.fn('sum', sequelize.col('creditAmount')), 'totalCredit']
      ],
      group: ['ledgerId']
    });

    // Map balances to ledgers
    const ledgerBalances = ledgers.map(ledger => {
      const entry = entries.find(e => e.ledgerId === ledger.id);
      const debit = entry ? parseFloat(entry.getDataValue('totalDebit') || 0) : 0;
      const credit = entry ? parseFloat(entry.getDataValue('totalCredit') || 0) : 0;
      // Opening balance could be added here if we had openingBalance field
      const openingBalance = parseFloat(ledger.openingBalance || 0);
      const isDebitOB = ledger.openingBalanceType === 'Dr';
      
      const netDebit = debit + (isDebitOB ? openingBalance : 0);
      const netCredit = credit + (!isDebitOB ? openingBalance : 0);
      
      let closingBalance = 0;
      let balanceType = '';

      if (netDebit > netCredit) {
        closingBalance = netDebit - netCredit;
        balanceType = 'Dr';
      } else if (netCredit > netDebit) {
        closingBalance = netCredit - netDebit;
        balanceType = 'Cr';
      }

      return {
        ...ledger.toJSON(),
        totalDebit: debit,
        totalCredit: credit,
        closingBalance,
        balanceType
      };
    });

    // 2. Aggregate into Groups
    const groups = await AccountGroup.findAll();
    
    // Recursive function to build group hierarchy and roll up balances
    const buildHierarchy = (parentId) => {
      const childGroups = groups.filter(g => g.parentGroupId === parentId);
      const result = [];
      
      for (const group of childGroups) {
        const myLedgers = ledgerBalances.filter(l => l.groupId === group.id);
        const children = buildHierarchy(group.id);
        
        let totalDr = myLedgers.filter(l => l.balanceType === 'Dr').reduce((s, l) => s + l.closingBalance, 0);
        let totalCr = myLedgers.filter(l => l.balanceType === 'Cr').reduce((s, l) => s + l.closingBalance, 0);
        
        children.forEach(c => {
          if (c.balanceType === 'Dr') totalDr += c.closingBalance;
          if (c.balanceType === 'Cr') totalCr += c.closingBalance;
        });

        let closingBalance = 0;
        let balanceType = '';
        if (totalDr > totalCr) {
          closingBalance = totalDr - totalCr;
          balanceType = 'Dr';
        } else if (totalCr > totalDr) {
          closingBalance = totalCr - totalDr;
          balanceType = 'Cr';
        }

        result.push({
          id: group.id,
          name: group.name,
          isRevenue: group.isRevenue,
          ledgers: myLedgers,
          children,
          closingBalance,
          balanceType
        });
      }
      return result;
    };

    const trialBalance = buildHierarchy(null);

    // 3. Separate P&L and Balance Sheet
    // By convention, Tally puts 'Sales Accounts' & 'Direct Incomes' on Right side of Trading A/c
    // 'Purchase Accounts' & 'Direct Expenses' on Left.
    // Let's do a simplified P&L where Revenue groups are taken.
    
    // Flatten hierarchy helper to find all revenue groups
    const flattenGroups = (nodes) => {
      let arr = [];
      nodes.forEach(n => {
        arr.push(n);
        arr = arr.concat(flattenGroups(n.children));
      });
      return arr;
    };

    const allGroupNodes = flattenGroups(trialBalance);
    
    // For P&L, find all nodes where isRevenue = true
    const plGroups = allGroupNodes.filter(g => g.isRevenue);
    
    // Calculate Gross/Net Profit
    // Simplified: Income (Cr) - Expenses (Dr) = Profit
    let totalIncome = plGroups.filter(g => g.balanceType === 'Cr').reduce((s, g) => s + g.closingBalance, 0);
    let totalExpense = plGroups.filter(g => g.balanceType === 'Dr').reduce((s, g) => s + g.closingBalance, 0);
    
    const netProfit = totalIncome - totalExpense; // If > 0, Profit. If < 0, Loss.

    // For Balance Sheet, isRevenue = false
    const bsGroups = allGroupNodes.filter(g => !g.isRevenue && !groups.find(ag => ag.id === g.id).parentGroupId); 
    // ^ only top level BS groups to avoid double counting

    res.json({
      trialBalance,
      profitAndLoss: {
        groups: plGroups,
        totalIncome,
        totalExpense,
        netProfit
      },
      balanceSheet: {
        groups: bsGroups, // e.g. Capital Account, Current Liabilities, Current Assets
        netProfit // To be added to Capital/Reserves side
      }
    });
  } catch (error) {
    console.error('Reports Error:', error);
    res.status(500).json({ message: 'Failed to generate reports', error: error.message });
  }
};
