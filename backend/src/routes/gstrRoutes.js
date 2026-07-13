const express = require('express');
const router = express.Router();
const gstrController = require('../controllers/gstrController');

router.get('/gstr1', gstrController.getGSTR1);

module.exports = router;
