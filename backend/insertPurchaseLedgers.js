require('dotenv').config();
const { Ledger, Company } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function run() {
  await sequelize.authenticate();
  const defaultCompany = await Company.findOne({ order: [['id', 'ASC']] });
  if (!defaultCompany) {
    console.log("No company found.");
    process.exit(0);
  }
  const companyId = defaultCompany.id;
  
  const ledgersData = [
      { name: 'Purchase Exempt', groupId: 9, balanceType: 'Dr' },
      { name: 'Purchase 5%', groupId: 9, balanceType: 'Dr' },
      { name: 'Purchase 12%', groupId: 9, balanceType: 'Dr' },
      { name: 'Purchase 18%', groupId: 9, balanceType: 'Dr' },
      { name: 'Purchase 28%', groupId: 9, balanceType: 'Dr' },
  ];
  
  for (const l of ledgersData) {
      await Ledger.findOrCreate({
        where: { name: l.name, companyId },
        defaults: { ...l, companyId }
      });
  }
  console.log("Ledgers added successfully.");
  process.exit(0);
}
run();
