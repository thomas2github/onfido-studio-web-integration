const express = require('express');
const router = express.Router();

const dashboard_controller = require('../controllers/dashboardController.js');
const login_controller = require('../controllers/loginController.js');

const auth = require('../auth');

router.get('/', function(req, res) {
  res.redirect('/dashboard');
});

router.get('/dashboard', auth, dashboard_controller.dashboard);
router.get('/login', login_controller.getLogin);
router.post('/login', login_controller.postLogin);
router.get('/logout', login_controller.logout);

module.exports = router;
