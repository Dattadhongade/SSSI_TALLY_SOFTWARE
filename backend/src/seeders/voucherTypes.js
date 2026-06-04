const { VoucherType } = require('../models');

async function seedVoucherTypes() {
  const types = [
    {
      name: 'Sales',
      typeOfVoucher: 'Sales',
      methodOfVoucherNumbering: 'Automatic',
      prefix: 'SSSI/26-27/',
      startingNumber: 1
    },
    {
      name: 'Purchase',
      typeOfVoucher: 'Purchase',
      methodOfVoucherNumbering: 'Automatic',
      prefix: '',
      startingNumber: 1
    },
    {
      name: 'Payment',
      typeOfVoucher: 'Payment',
      methodOfVoucherNumbering: 'Automatic',
      prefix: '',
      startingNumber: 1
    },
    {
      name: 'Receipt',
      typeOfVoucher: 'Receipt',
      methodOfVoucherNumbering: 'Automatic',
      prefix: '',
      startingNumber: 1
    },
    {
      name: 'Purchase Order',
      typeOfVoucher: 'Purchase Order',
      methodOfVoucherNumbering: 'Automatic',
      prefix: 'SSSI/PO/26-27/',
      startingNumber: 1
    },
    {
      name: 'Contra',
      typeOfVoucher: 'Contra',
      methodOfVoucherNumbering: 'Automatic',
      prefix: '',
      startingNumber: 1
    },
    {
      name: 'Journal',
      typeOfVoucher: 'Journal',
      methodOfVoucherNumbering: 'Automatic',
      prefix: '',
      startingNumber: 1
    }
  ];

  for (const type of types) {
    await VoucherType.findOrCreate({
      where: { name: type.name },
      defaults: type
    });
  }
  console.log('Voucher Types Seeded!');
}

module.exports = seedVoucherTypes;
