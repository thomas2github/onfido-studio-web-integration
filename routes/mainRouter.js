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
router.get('/stacktrace/clear', auth, main_controller.clearStacktrace);

router.get('/applicants', auth, main_controller.listApplicants);
router.post('/applicants/new', auth, main_controller.createApplicant);
router.post('/applicants/delete', auth, main_controller.deleteApplicants);
router.get('/applicants/:id', auth, main_controller.retrieveApplicant);
router.get('/applicants/:id/delete', auth, main_controller.deleteApplicant);
router.post('/applicants/:id', auth, main_controller.updateApplicant);

router.get('/documents/:id', auth, main_controller.downloadDocument)
router.get('/photos/:id', auth, main_controller.downloadPhoto)
router.get('/videos/:id', auth, main_controller.downloadVideoFrame)

router.get('/search', auth, main_controller.globalSearch)

// SDK & CHECK
router.get('/sdk', auth, main_controller.initSdk);
// router.post('/sdk', auth, main_controller.upload);
router.get('/orchestration', auth, main_controller.initOrchestration);
router.get('/authenticate', auth, main_controller.initSdkAuth);

router.get('/checks', auth, main_controller.listChecks);
router.get('/checks/new', auth, main_controller.initCheck);
router.post('/checks/new', auth, main_controller.createCheck);
router.get('/checks/:id', auth, main_controller.retrieveCheck);

router.get('/workflow-runs/:id', auth, main_controller.retrieveWorkflowRun);

router.get('/reports/:id', auth, main_controller.retrieveReport);

router.get('/autofill/:id', auth, main_controller.autofill)

router.get('/trusted-face/:type/:id', auth, main_controller.trustedface)

// USE CASE
router.get('/usecases/select', auth, main_controller.selectUseCase);
// REGISTRATION
router.get('/usecases/registration', auth, main_controller.registrationUseCase);
router.get('/usecases/registration/:step', auth, main_controller.registrationUseCase);
router.post('/usecases/registration/:step', auth, main_controller.registrationUseCase);
// router.get('/usecases/verification', auth, main_controller.verificationUseCase);
// router.get('/usecases/authentication', auth, main_controller.authenticationUseCase);


module.exports = router;
