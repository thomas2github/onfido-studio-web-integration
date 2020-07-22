var express = require('express');
var router = express.Router();

// Require controller modules.
var usecases_controller = require('../controllers/usecasesController.js');

/// ROUTES ///
router.get('/', usecases_controller.usecases_home);

router.get('/doc-plus-selfie', usecases_controller.usecases_doc_plus_selfie);
router.get('/create-doc-plus-selfie-check/:id', usecases_controller.usecases_create_doc_plus_selfie_check);

router.get('/doc-plus-video', usecases_controller.usecases_doc_plus_video);
router.get('/create-doc-plus-video-check/:id', usecases_controller.usecases_create_doc_plus_video_check);

router.get('/watchlist', usecases_controller.usecases_watchlist);
router.post('/watchlist', usecases_controller.usecases_create_watchlist_check);

router.get('/autofill', usecases_controller.usecases_autofill);
router.post('/autofill', usecases_controller.usecases_create_autofill_check);

router.get('/known-faces', usecases_controller.usecases_known_faces);
router.get('/create-known-faces-check/:id', usecases_controller.usecases_create_known_faces_check);

module.exports = router;
