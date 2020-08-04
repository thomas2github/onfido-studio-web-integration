const express = require('express');
const router = express.Router();

// Require controller modules.
const reports_controller = require('../controllers/reportsController.js');

const auth = require('../auth');

/// ROUTES ///
router.get('/', auth, reports_controller.reports_home);
router.get('/document', auth, reports_controller.reports_document);
router.get('/facial-similarity', auth, reports_controller.reports_facial_similarity);
router.get('/watchlist', auth, reports_controller.reports_watchlist);
router.get('/identity-enhanced', auth, reports_controller.reports_identity_enhanced);
router.get('/known-faces', auth, reports_controller.reports_known_faces);
router.get('/proof-of-address', auth, reports_controller.reports_poa);
router.get('/right-to-work', auth, reports_controller.reports_rtw);

module.exports = router;
