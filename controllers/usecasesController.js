const onfido = require('../onfido.js');
const { Onfido, OnfidoApiError } = require('@onfido/api');
const moment = require('moment');
const { findSeries } = require('async');
const fs = require('fs');


// Display list of all usecases.
exports.usecases_home = function(req, res) {
    res.send('not yet implemented');
};

exports.usecases_doc_plus_selfie = function(req, res) {
    const now = moment().format('YYYYMMDD-HHmmss');
    // Create applicant
    onfido.applicant
        .create({
            firstName: 'fn-' + now,
            lastName: 'ln-' + now
        })
        .then((applicant) => {
            const referrer = '*://*/*';
            console.log('>>>>>>>        referrer: ' + referrer);
            const sdkTokenRequest = {
                applicantId: applicant.id,
                // referrer: 'http://localhost:3000/*'
                referrer: referrer
            };         
            // Get SDK Token
            onfido.sdkToken.generate( sdkTokenRequest )
                .then((sdkToken) => {
                    res.render('docPlusSelfie', {applicant: applicant, sdkToken: sdkToken});
                });
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

exports.usecases_create_doc_plus_selfie_check = function(req, res) {
    const applicantId = req.params.id;
    // Create check
    onfido.check
        .create({
            applicantId: applicantId,
            reportNames: ['document', 'facial_similarity_photo'],
            // documentsId: documentsId,
        })
        .then((check) => {
            res.redirect('/resources/checks/' + check.id);
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

exports.usecases_doc_plus_video = function(req, res) {
    const now = moment().format('YYYYMMDD-HHmmss');
    // Create applicant
    onfido.applicant
        .create({
            firstName: 'fn-' + now,
            lastName: 'ln-' + now
        })
        .then((applicant) => {
            const sdkTokenRequest = {
                applicantId: applicant.id,
                referrer: 'http://localhost:3000/*'
            };         
            // Get SDK Token
            onfido.sdkToken.generate( sdkTokenRequest )
                .then((sdkToken) => {
                    res.render('docPlusVideo', {applicant: applicant, sdkToken: sdkToken});
                });
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

exports.usecases_create_doc_plus_video_check = function(req, res) {
    const applicantId = req.params.id;
    // Create check
    onfido.check
        .create({
            applicantId: applicantId,
            reportNames: ['document', 'facial_similarity_video'],
            // documentsId: documentsId,
        })
        .then((check) => {
            res.redirect('/resources/checks/' + check.id);
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

exports.usecases_watchlist = function(req, res) {
    res.render('watchlist');
};

exports.usecases_create_watchlist_check = function(req, res) {
    // Validate fields.
    body('firstName', 'Firstname must not be empty.').trim().isLength({ min: 1 }),
    body('lastName', 'Lastname must not be empty.').trim().isLength({ min: 1 }),

    // Sanitize fields.
    sanitizeBody('firstName').escape(),
    sanitizeBody('lastName').escape(),

    onfido.applicant
        .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName
        })
        .then((applicant) => {
            onfido.check
                .create({
                    applicantId: applicant.id,
                    reportNames: [req.body.reportType],
                    // documentsId: documentsId,
                })
                .then((check) => {
                    res.redirect('/resources/checks/' + check.id);
                });
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

exports.usecases_autofill = function(req, res) {
    const countries = require('../datas/supportedDocumentsByCountry.json');
    res.render('autofill', {countries: countries});
};

exports.usecases_create_autofill_check = function(req, res) {
    // create applicant
    const countries = require('../datas/supportedDocumentsByCountry.json');
    const now = moment().format('YYYYMMDD-HHmmss');
    let fileToExtract = req.files.file;
    fileToExtract.mv('./uploads/' + fileToExtract.name);
    
    onfido.applicant.create({
        firstName: 'fn-' + now,
        lastName: 'ln-' + now 
    })
    .then((applicant) => {
        // upload document
        onfido.document.upload({
            applicantId: applicant.id, 
            issuingCountry: req.body.issuingCountry,
            type: req.body.type,
            side: req.body.side,
            file: fs.createReadStream('./uploads/' + fileToExtract.name)
        })
        .then((document) => 
            // call autofill
            onfido.autofill.perform(document.id)
            .then((result) => {
                // update applicant
                applicantRequest = {
                    firstName: result.extractedData.firstName,
                    lastName: result.extractedData.lastName,
                    dob: new Date(result.extractedData.dateOfBirth),
                },

                onfido.applicant.update(
                    applicant.id, 
                    applicantRequest
                )
                .then(() => {
                    res.render('autofill', {applicantId: applicant.id, result: result, countries: countries});
                })
            })
        )
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
    // display applicant
};

exports.usecases_known_faces = function(req, res) {
    const now = moment().format('YYYYMMDD-HHmmss');
    // Create applicant
    onfido.applicant
        .create({
            firstName: 'fn-' + now,
            lastName: 'ln-' + now
        })
        .then((applicant) => {
            const sdkTokenRequest = {
                applicantId: applicant.id,
                referrer: 'http://localhost:3000/*'
            };         
            // Get SDK Token
            onfido.sdkToken.generate( sdkTokenRequest )
                .then((sdkToken) => {
                    res.render('knownFaces', {applicant: applicant, sdkToken: sdkToken});
                });
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

exports.usecases_create_known_faces_check = function(req, res) {
    // Create check
    onfido.check
        .create({
            applicantId: req.params.id,
            reportNames: ['known_faces'],
            // documentsId: documentsId,
        })
        .then((check) => {
            res.redirect('/resources/checks/' + check.id);
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