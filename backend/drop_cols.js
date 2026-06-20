require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function dropUnusedColumns() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    const queryInterface = sequelize.getQueryInterface();
    const columnsToDrop = [
      'referenceNumber',
      'referenceDate',
      'eWayBillNumber',
      'eWayBillDate',
      'transporterId',
      'transporterName',
      'transporterGstin',
      'vehicleNumber',
      'transportMode',
      'distance',
      'irn',
      'ackNo',
      'ackDate',
      'qrCode'
    ];
    
    for (const col of columnsToDrop) {
      try {
        await queryInterface.removeColumn('Vouchers', col);
        console.log(`Dropped ${col}`);
      } catch (err) {
        console.log(`Could not drop ${col} (maybe already dropped)`);
      }
    }
    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

dropUnusedColumns();
