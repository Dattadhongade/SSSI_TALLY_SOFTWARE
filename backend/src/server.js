require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const unitRoutes = require('./routes/unitRoutes');
const stockItemRoutes = require('./routes/stockItemRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const gstRoutes = require('./routes/gstRoutes');
const accountGroupRoutes = require('./routes/accountGroupRoutes');
const stockGroupRoutes = require('./routes/stockGroupRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/stockitems', stockItemRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/account-groups', accountGroupRoutes);
app.use('/api/stock-groups', stockGroupRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middleware Connection
const db = require('./models');
const { sequelize } = require('./config/database');

// Sync Models
db.sequelize.sync()
  .then(async () => {
    console.log('\x1b[32m%s\x1b[0m', '✓ Database Synced');
    const seedVoucherTypes = require('./seeders/voucherTypes');
    await seedVoucherTypes();
    const seedAccountGroups = require('./seeders/accountGroups');
    await seedAccountGroups();
    const seedLedgers = require('./seeders/ledgers');
    await seedLedgers();
    const seedUnits = require('./seeders/units');
    await seedUnits();
    const seedStockGroups = require('./seeders/stockGroups');
    await seedStockGroups();
  })
  .catch(err => console.log('\x1b[31m%s\x1b[0m', '✗ Error syncing DB: ' + err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `Server running on port ${PORT}`);
});
