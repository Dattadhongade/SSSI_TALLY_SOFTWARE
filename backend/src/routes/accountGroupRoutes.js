const express = require('express');
const router = express.Router();
const accountGroupController = require('../controllers/accountGroupController');

router.post('/', accountGroupController.createGroup);
router.get('/', accountGroupController.getGroups);
router.put('/:id', accountGroupController.updateGroup);
router.delete('/:id', accountGroupController.deleteGroup);

module.exports = router;
