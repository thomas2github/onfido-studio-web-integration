var express = require('express');
var router = express.Router();

var dashboard_controller = require('../controllers/dashboardController.js');

router.get('/', function(req, res) {
  res.redirect('/dashboard');
});

router.get('/dashboard', dashboard_controller.dashboard);

module.exports = router;
