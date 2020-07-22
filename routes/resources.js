var express = require('express');
var router = express.Router();

// Require controller modules.
var applicant_controller = require('../controllers/applicantController.js');
var check_controller = require('../controllers/checkController');
var report_controller = require('../controllers/reportController');
var document_controller = require('../controllers/documentController');
var photo_controller = require('../controllers/photoController');
var video_controller = require('../controllers/videoController');

router.get('/', function(req, res) {
    res.redirect('/resources/applicants');
});

/// APPLICANT ROUTES ///
router.get('/applicants', applicant_controller.applicant_list);
router.get('/applicants/new', applicant_controller.applicant_new);
router.post('/applicants/new', applicant_controller.applicant_create);
router.get('/applicants/:id', applicant_controller.applicant_show);
router.get('/applicants/:id/edit', applicant_controller.applicant_edit);
router.post('/applicants/:id/edit', applicant_controller.applicant_update);
router.get('/applicants/:id/delete', applicant_controller.applicant_delete);

/// CHECK ROUTES ///
router.get('/applicants/:id/checks', check_controller.check_list);
router.get('/applicants/:id/checks/new', check_controller.check_new);
router.post('/applicants/:id/checks/new', check_controller.check_create);
router.get('/checks/:id', check_controller.check_show);

/// REPORT ROUTES ///
router.get('/checks/:id/reports', report_controller.report_list);
router.get('/reports/:id', report_controller.report_show);

/// DOCUMENT ROUTES ///
router.get('/applicants/:id/documents', document_controller.document_list);
router.get('/applicants/:id/documents/upload', document_controller.document_upload);
router.post('/applicants/:id/documents/upload', document_controller.document_save);
router.get('/documents/:id', document_controller.document_show);
router.get('/documents/:id/download', document_controller.document_download);

/// PHOTO ROUTES ///
router.get('/applicants/:id/photos', photo_controller.photo_list);
router.get('/applicants/:id/photos/upload', photo_controller.photo_upload);
router.post('/applicants/:id/photos/upload', photo_controller.photo_save);
router.get('/photos/:id', photo_controller.photo_show);
router.get('/photos/:id/download', photo_controller.photo_download);

/// VIDEO ROUTES ///
router.get('/applicants/:id/videos', video_controller.video_list);
router.get('/applicants/:id/videos/upload', video_controller.video_upload);
router.get('/videos/:id', video_controller.video_show);
router.get('/videos/:id/download', video_controller.video_download);
router.get('/videos/:id/frame', video_controller.video_frame);

module.exports = router;
