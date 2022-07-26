const express = require('express');
const router = express.Router();

const main_controller = require('../controllers/mainController.js');
const login_controller = require('../controllers/loginController.js');

const auth = require('../auth');

router.get('/', function(req, res) {
  res.redirect('/index');
});

// GLOBAL
router.get('/index', auth, main_controller.index);

router.get('/login', login_controller.getLogin);
router.post('/login', login_controller.postLogin);
router.get('/logout', login_controller.logout);

router.get('/restart', auth, main_controller.clearSession);

router.post('/launcher', auth, main_controller.launcher);

module.exports = router;
