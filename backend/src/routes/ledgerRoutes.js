const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply auth middleware to all ledger routes
router.use(authMiddleware);

router.post('/', ledgerController.createLedger);
router.get('/', ledgerController.getLedgers);
router.get('/:id', ledgerController.getLedgerById);
router.post('/:id', ledgerController.updateLedger);
router.delete('/:id', ledgerController.deleteLedger);

module.exports = router;
