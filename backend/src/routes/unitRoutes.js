const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', unitController.createUnit);
router.post('/:id', unitController.createUnit); // Support for edit
router.get('/', unitController.getUnits);
router.get('/:id', unitController.getUnitById);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;
