const express = require('express');
const router = express.Router();

const main_controller = require('../controllers/mainController.js');
const login_controller = require('../controllers/loginController.js');

const auth = require('../auth');

router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/login', login_controller.getLogin);
router.post('/login', login_controller.postLogin);
router.get('/logout', login_controller.logout);

router.get('/index', auth, main_controller.index);
router.get('/restart', auth, main_controller.clearSession);
router.get('/stacktrace/clear', auth, main_controller.clearStacktrace);

router.get('/applicants/:id', auth, main_controller.retrieveApplicant);
router.post('/applicants/new', auth, main_controller.createApplicant);
router.get('/applicants/:id/delete', auth, main_controller.deleteApplicant);
router.get('/applicants', auth, main_controller.listApplicants);
router.post('/applicants/delete', auth, main_controller.deleteApplicants);

router.get('/sdk', auth, main_controller.initSdk);

router.get('/checks/new', auth, main_controller.initCheck);
router.post('/checks/new', auth, main_controller.createCheck);
router.get('/checks/:id', auth, main_controller.retrieveCheck);
router.get('/checks', auth, main_controller.listChecks);

module.exports = router;
