const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', currencyController.createCurrency);
router.post('/:id', currencyController.createCurrency); // Support for edit
router.get('/', currencyController.getCurrencies);
router.get('/:id', currencyController.getCurrencyById);
router.delete('/:id', currencyController.deleteCurrency);

module.exports = router;
