var onfido = require('../onfido.js');
var stream = require('stream');
const { Onfido, OnfidoApiError } = require('@onfido/api');
const { body,sanitizeBody, validationResult } = require('express-validator');
const fs = require('fs');

// Display list of all photos for an applicant.
exports.photo_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Photo list for applicant:' + req.params.id);
};

// Display photo upload form.
exports.photo_upload = function(req, res) {
    const photo = {
        applicant_id: req.params.id
    };
    const refferer = req.protocol + '://' + req.hostname + ':*/*';
    const sdkTokenRequest = {
        applicantId: req.params.id,
        // referrer: 'http://localhost:3000/*'
        referrer: refferer
    };
    onfido.sdkToken.generate( sdkTokenRequest )
        .then((sdkToken) => {
            res.render('photoUpload', { photo: photo, sdkToken: sdkToken });
        })
        .catch((error) => {
            if (error instanceof OnfidoApiError) {
                // An error response was received from the Onfido API, extra info is available.
                console.log(error.message);
                console.log(error.type);
                console.log(error.isClientError());
            } else {
                // No response was received for some reason e.g. a network error.
                console.log(error.message);
            }
        });
};

// Handle photo save on POST.
exports.photo_save = function(req, res) {
    
    // Validate file
    body('file').custom((value, { req }) => {
        if (!req.files) {
          throw new Error('File must not be empty.');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),

    onfido.livePhoto
        .upload({
            applicantId: req.params.id, 
            advancedValidation: req.body.advancedValidation,
            file: fs.ReadStream(req.files.file.tempFilePath)
        })
        .then((document) => 
            res.redirect('/resources/applicants/'+document.applicant_id)
        )
        .catch((error) => {
            if (error instanceof OnfidoApiError) {
                // An error response was received from the Onfido API, extra info is available.
                console.log(error.message);
                console.log(error.type);
                console.log(error.isClientError());
            } else {
                // No response was received for some reason e.g. a network error.
                console.log(error.message);
            }
        });
};

// Display detail page for a specific photo.
exports.photo_show = function(req, res) {
    onfido.livePhoto.find(req.params.id)
        .then((photo) => {            
            res.render('photo', { photo: photo })
        })
        .catch((error) => {
            if (error instanceof OnfidoApiError) {
                // An error response was received from the Onfido API, extra info is available.
                console.log(error.message);
                console.log(error.type);
                console.log(error.isClientError());
            } else {
                // No response was received for some reason e.g. a network error.
                console.log(error.message);
            }
        });
};

// Download a specific photo.
exports.photo_download = function(req, res) {
    res.send('NOT IMPLEMENTED: Photo download: ' + req.params.id);
};