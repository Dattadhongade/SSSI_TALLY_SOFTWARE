require('dotenv').config();
const { VoucherType, Company } = require('./src/models');

async function seed() {
  const companies = await Company.findAll();
  if (companies.length === 0) {
    console.log('No companies found.');
    process.exit(0);
  }

  const defaultVoucherTypes = [
    { name: 'Sales', typeOfVoucher: 'Sales', methodOfVoucherNumbering: 'Automatic', prefix: 'SSSI/' },
    { name: 'Purchase', typeOfVoucher: 'Purchase', methodOfVoucherNumbering: 'Automatic', prefix: 'PUR/' },
    { name: 'Receipt', typeOfVoucher: 'Receipt', methodOfVoucherNumbering: 'Automatic', prefix: 'REC/' },
    { name: 'Payment', typeOfVoucher: 'Payment', methodOfVoucherNumbering: 'Automatic', prefix: 'PAY/' },
    { name: 'Contra', typeOfVoucher: 'Contra', methodOfVoucherNumbering: 'Automatic', prefix: 'CON/' },
    { name: 'Journal', typeOfVoucher: 'Journal', methodOfVoucherNumbering: 'Automatic', prefix: 'JRN/' }
  ];

  for (const company of companies) {
    for (const vt of defaultVoucherTypes) {
      const exists = await VoucherType.findOne({ where: { name: vt.name, companyId: company.id } });
      if (!exists) {
        await VoucherType.create({
          ...vt,
          companyId: company.id,
          userId: 1 // Assuming admin user id 1
        });
        console.log(`Created ${vt.name} for company ${company.name}`);
      }
    }
  }
  console.log('Done.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
