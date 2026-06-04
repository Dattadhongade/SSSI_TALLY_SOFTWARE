const { Unit } = require('../models');

const seedUnits = async () => {
  try {
    const units = [
      { id: 1, symbol: 'PCS', formalName: 'Pieces', numberOfDecimalPlaces: 0 },
      { id: 2, symbol: 'KG', formalName: 'Kilograms', numberOfDecimalPlaces: 2 },
    ];

    for (const unit of units) {
      await Unit.findOrCreate({
        where: { id: unit.id },
        defaults: unit
      });
    }
    console.log('\x1b[32m%s\x1b[0m', '✓ Units Seeded');
  } catch (error) {
    console.error('Error seeding Units:', error);
  }
};

module.exports = seedUnits;
