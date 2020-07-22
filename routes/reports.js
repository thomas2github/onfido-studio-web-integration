var express = require('express');
var router = express.Router();

// Require controller modules.
var reports_controller = require('../controllers/reportsController.js');

/// ROUTES ///
router.get('/', reports_controller.reports_home);
router.get('/document', reports_controller.reports_document);
router.get('/facial-similarity', reports_controller.reports_facial_similarity);
router.get('/watchlist', reports_controller.reports_watchlist);
router.get('/identity-enhanced', reports_controller.reports_identity_enhanced);
router.get('/known-faces', reports_controller.reports_known_faces);
router.get('/proof-of-address', reports_controller.reports_poa);
router.get('/right-to-work', reports_controller.reports_rtw);

module.exports = router;
