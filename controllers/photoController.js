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
    const referrer = '*://*/*';
    console.log('>>>>>>>        referrer: ' + referrer);
    const sdkTokenRequest = {
        applicantId: req.params.id,
        // referrer: 'http://localhost:3000/*'
        referrer: referrer
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

    let fileToUpload = req.files.file;
    fileToUpload.mv('./uploads/' + fileToUpload.name);

    onfido.livePhoto
        .upload({
            applicantId: req.params.id, 
            advancedValidation: req.body.advancedValidation,
            file: fs.ReadStream('./uploads/' + fileToUpload.name)
        })
        .then((document) => 
            res.redirect('/resources/applicants/'+req.params.id)
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