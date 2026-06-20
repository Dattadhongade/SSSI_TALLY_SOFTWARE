const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/financials', reportController.getFinancialReports);

module.exports = router;
