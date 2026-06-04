const { StockGroup } = require('../models');

const seedStockGroups = async () => {
  try {
    const groups = [
      { id: 1, name: 'Raw Materials', alias: '' },
      { id: 2, name: 'Finished Goods', alias: '' },
    ];

    for (const group of groups) {
      await StockGroup.findOrCreate({
        where: { id: group.id },
        defaults: group
      });
    }
    console.log('\x1b[32m%s\x1b[0m', '✓ Stock Groups Seeded');
  } catch (error) {
    console.error('Error seeding Stock Groups:', error);
  }
};

module.exports = seedStockGroups;
