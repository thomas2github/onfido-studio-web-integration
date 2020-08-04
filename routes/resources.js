const express = require('express');
const router = express.Router();

// Require controller modules.
const applicant_controller = require('../controllers/applicantController.js');
const check_controller = require('../controllers/checkController');
const report_controller = require('../controllers/reportController');
const document_controller = require('../controllers/documentController');
const photo_controller = require('../controllers/photoController');
const video_controller = require('../controllers/videoController');

const auth = require('../auth');

router.get('/', auth, function(req, res) {
    res.redirect('/resources/applicants');
});

/// APPLICANT ROUTES ///
router.get('/applicants', auth, applicant_controller.applicant_list);
router.get('/applicants/new', auth, applicant_controller.applicant_new);
router.post('/applicants/new', auth, applicant_controller.applicant_create);
router.get('/applicants/:id', auth, applicant_controller.applicant_show);
router.get('/applicants/:id/edit', auth, applicant_controller.applicant_edit);
router.post('/applicants/:id/edit', auth, applicant_controller.applicant_update);
router.get('/applicants/:id/delete', auth, applicant_controller.applicant_delete);

/// CHECK ROUTES ///
router.get('/applicants/:id/checks', auth, check_controller.check_list);
router.get('/applicants/:id/checks/new', auth, check_controller.check_new);
router.post('/applicants/:id/checks/new', auth, check_controller.check_create);
router.get('/checks/:id', auth, check_controller.check_show);

/// REPORT ROUTES ///
router.get('/checks/:id/reports', auth, report_controller.report_list);
router.get('/reports/:id', auth, report_controller.report_show);

/// DOCUMENT ROUTES ///
router.get('/applicants/:id/documents', document_controller.document_list);
router.get('/applicants/:id/documents/upload', document_controller.document_upload);
router.post('/applicants/:id/documents/upload', document_controller.document_save);
router.get('/documents/:id', document_controller.document_show);
router.get('/documents/:id/download', document_controller.document_download);

/// PHOTO ROUTES ///
router.get('/applicants/:id/photos', auth, photo_controller.photo_list);
router.get('/applicants/:id/photos/upload', auth, photo_controller.photo_upload);
router.post('/applicants/:id/photos/upload', auth, photo_controller.photo_save);
router.get('/photos/:id', auth, photo_controller.photo_show);
router.get('/photos/:id/download', auth, photo_controller.photo_download);

/// VIDEO ROUTES ///
router.get('/applicants/:id/videos', auth, video_controller.video_list);
router.get('/applicants/:id/videos/upload', auth, video_controller.video_upload);
router.get('/videos/:id', auth, video_controller.video_show);
router.get('/videos/:id/download', auth, video_controller.video_download);
router.get('/videos/:id/frame', auth, video_controller.video_frame);

module.exports = router;
