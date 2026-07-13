const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createGenericController } = require('../controllers/genericController');
const { TaxMaster, HSNMaster, Transporter, VehicleMaster } = require('../models');

// Apply auth middleware
router.use(authMiddleware);

const masters = [
  { path: '/taxes', model: TaxMaster },
  { path: '/hsn', model: HSNMaster },
  { path: '/transporters', model: Transporter },
  { path: '/vehicles', model: VehicleMaster },
];

masters.forEach(({ path, model }) => {
  const controller = createGenericController(model);
  router.get(path, controller.getAll);
  router.get(`${path}/:id`, controller.getById);
  router.post(path, controller.create);
  router.put(`${path}/:id`, controller.update);
  router.delete(`${path}/:id`, controller.delete);
});

module.exports = router;
