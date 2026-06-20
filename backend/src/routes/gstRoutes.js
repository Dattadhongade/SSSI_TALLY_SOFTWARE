const express = require('express');
const router = express.Router();
const gstController = require('../controllers/gstController');
const protect = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/gstr1', gstController.getGSTR1);
router.get('/gstr2', gstController.getGSTR2);
router.get('/gstr3b', gstController.getGSTR3B);

router.post('/ewaybill', gstController.generateEwayBill);
router.post('/einvoice', gstController.generateEInvoice);

module.exports = router;
