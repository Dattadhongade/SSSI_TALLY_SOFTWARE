const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply auth middleware to all voucher routes
router.use(authMiddleware);

router.post('/', voucherController.createVoucher);
router.get('/', voucherController.getVouchers);
router.get('/types', voucherController.getVoucherTypes);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

// Compliance routes
router.post('/:id/generate-einvoice', voucherController.generateEInvoice);
router.post('/:id/generate-ewaybill', voucherController.generateEwayBill);

module.exports = router;
