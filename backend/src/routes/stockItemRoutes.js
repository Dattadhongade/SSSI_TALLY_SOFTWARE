const express = require('express');
const router = express.Router();
const stockItemController = require('../controllers/stockItemController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply auth middleware to all stock item routes
router.use(authMiddleware);

router.post('/', stockItemController.createStockItem);
router.get('/', stockItemController.getStockItems);
router.get('/:id', stockItemController.getStockItemById);
router.post('/:id', stockItemController.updateStockItem);
router.delete('/:id', stockItemController.deleteStockItem);

module.exports = router;
