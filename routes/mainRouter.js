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

router.get('/checks', auth, main_controller.listChecks);
router.get('/checks/new', auth, main_controller.initCheck);
router.post('/checks/new', auth, main_controller.createCheck);
router.get('/checks/:id', auth, main_controller.retrieveCheck);

router.get('/reports/:id', auth, main_controller.retrieveReport);

router.get('/autofill/:id', auth, main_controller.autofill)

// USE CASE
router.get('/usecases/new', auth, main_controller.configureUseCase);
router.post('/usecases/new', auth, main_controller.generateUseCase);
router.get('/usecases/capture', auth, main_controller.captureUseCase);
router.get('/applicants/:id/refresh-after-capture', auth, main_controller.refreshApplicantAfterCapture);
router.get('/usecases/autofill', auth, main_controller.autofillUsecase);
router.get('/usecases/check', auth, main_controller.checkUseCase);
router.get('/usecases/wait', auth, main_controller.waitUseCase);
router.get('/usecases/next', auth, main_controller.nextUseCase);

// TODO TGA: add many scenarios 
// OPTIONS
// Selfie or Video
// Known Faces verification
// Autofill to complete form and update applicant
// AUTO & MANUAL
// 1- wait 15s for callback and manage async then
// 2- manage async with callback
// ASYNC CHECK MANAGEMENT
// 1- confirm request (add stand-by state) when check succeed
// 2- wait for check success before creating request
// 3- validate request automatically, delete request if check failed

module.exports = router;
