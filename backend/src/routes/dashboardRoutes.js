const express = require('express');
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const router = express.Router();

router.use(auth);
router.get('/stats', dashboardController.getStats);
router.get('/graph', dashboardController.getGraphData);
router.get('/stock', dashboardController.getStockData);
router.get('/recent', dashboardController.getRecentTransactions);

module.exports = router;
