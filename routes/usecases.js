const express = require('express');
const router = express.Router();

// Require controller modules.
const usecases_controller = require('../controllers/usecasesController.js');

const auth = require('../auth');

/// ROUTES ///
router.get('/', auth, usecases_controller.usecases_home);

router.get('/doc-plus-selfie', auth, usecases_controller.usecases_doc_plus_selfie);
router.get('/create-doc-plus-selfie-check/:id', auth, usecases_controller.usecases_create_doc_plus_selfie_check);

router.get('/doc-plus-video', auth, usecases_controller.usecases_doc_plus_video);
router.get('/create-doc-plus-video-check/:id', auth, usecases_controller.usecases_create_doc_plus_video_check);

router.get('/watchlist', auth, usecases_controller.usecases_watchlist);
router.post('/watchlist', auth, usecases_controller.usecases_create_watchlist_check);

router.get('/autofill', auth, usecases_controller.usecases_autofill);
router.post('/autofill', auth, usecases_controller.usecases_create_autofill_check);

router.get('/known-faces', auth, usecases_controller.usecases_known_faces);
router.get('/create-known-faces-check/:id', auth, usecases_controller.usecases_create_known_faces_check);

module.exports = router;
