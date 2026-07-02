const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply auth middleware to all company routes
router.use(authMiddleware);

router.post('/', companyController.createCompany);
router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);
router.get('/:id/financial-years', companyController.getFinancialYears);
router.put('/:id', companyController.updateCompany);
router.put('/:id/gst', companyController.updateGstDetails);

module.exports = router;
