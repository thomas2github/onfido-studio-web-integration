const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController.js');
const demo_controller = require('../controllers/demoController.js');
const login_controller = require('../controllers/loginController.js');

const auth = require('../auth');

router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/login', login_controller.getLogin);
router.post('/login', login_controller.postLogin);
router.get('/logout', login_controller.logout);

router.get('/index', auth, index_controller.index);

router.get('/document-authentication', auth, demo_controller.docCheckNew);
router.post('/document-authentication', auth, demo_controller.docCheckCreate);

router.get('/check/:id', auth, demo_controller.checkResult);

router.get('/web-sdk-configuration', auth, demo_controller.webSdkConfiguration);

router.get('/reporting-and-monitoring', auth, demo_controller.reportingAndMonitoring);

router.get('/report', auth, demo_controller.report);

router.get('/self-identification/:step', auth, demo_controller.selfIdentification);

module.exports = router;
