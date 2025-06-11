const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const statsController = require('../controllers/statsController');

router.get('/stats', auth, statsController.getStats);

module.exports = router;
