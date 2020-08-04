// const onfido = require('../onfido.js');
const { Onfido, Region, OnfidoApiError } = require('@onfido/api');
const { body,sanitizeBody, validationResult } = require('express-validator');
const countries = require('../datas/supportedDocumentsByCountry.json');

// Display list of all applicants.
exports.applicant_list = function(req, res) {
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.applicant
        .list({ page: 0, perPage: 25, includeDeleted: false})
        .then((applicants) => 
            res.render('applicants', { applicants: applicants })
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

// Display applicant create form.
exports.applicant_new = function(req, res) {
    const applicant = {};
    res.render('applicantForm', { applicant: applicant, countries: countries });
};

// Handle applicant create on POST.
exports.applicant_create = function(req, res) {
    // Validate fields.
    body('firstName', 'Firstname must not be empty.').trim().isLength({ min: 1 });
    body('lastName', 'Lastname must not be empty.').trim().isLength({ min: 1 });

    // Sanitize fields.
    sanitizeBody('firstName').escape();
    sanitizeBody('lastName').escape();
    sanitizeBody('email').escape();
    sanitizeBody('dob').escape();
    // sanitizeBody('idNumbers.*').escape(),
    sanitizeBody('addresse.*').escape(); 

    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.applicant
        .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            dob: new Date(req.body.dob), 
            // id_numbers: req.body.idNumbers,
            address: req.body.address
        })
        .then((applicant) => 
            res.redirect('/resources/applicants/'+applicant.id)
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

// Display detail page for a specific applicant.
exports.applicant_show = function(req, res) {
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.applicant.find(req.params.id)
        .then((applicant) => {
            const documents = onfido.document.list(applicant.id);
            const photos = onfido.livePhoto.list(applicant.id);
            const videos = onfido.liveVideo.list(applicant.id);
            const checks = onfido.check.list(applicant.id);
            Promise.all([documents, photos, videos, checks])
                .then((children) => {
                    res.render('applicant', { applicant: applicant, countries: countries, documents: children[0], photos: children[1], videos: children[2], checks: children[3] })
                });
            }
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

// Display applicant edit form.
exports.applicant_edit = function(req, res) {
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.applicant.find(req.params.id)
    .then((applicant) => {
        res.render('applicantForm', { applicant: applicant, countries: countries });
    });
};

// Handle applicant update on POST.
exports.applicant_update = function(req, res) {
   
    // Validate fields.
    // Validate fields.
    body('firstName', 'Firstname must not be empty.').trim().isLength({ min: 1 });
    body('lastName', 'Lastname must not be empty.').trim().isLength({ min: 1 });

    // Sanitize fields.
    sanitizeBody('firstName').escape();
    sanitizeBody('lastName').escape();
    sanitizeBody('email').escape();
    sanitizeBody('dob').escape();
    // sanitizeBody('idNumbers.*').escape();
    sanitizeBody('addresse.*').escape(); 

    applicantRequest = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        dob: new Date(req.body.dob),
        // id_numbers: req.body.idNumbers,
        address: {
            flatNumber: req.body.addressFlatNumber,
            buildingNumber: req.body.addressBuildingNumber,
            buildingName: req.body.addressBuildingName,
            street: req.body.addressStreet,
            subStreet: req.body.addressSubStreet,
            town: req.body.addressTown,
            state: req.body.addressState,
            postcode: req.body.addressPostcode,
            country: req.body.addressCountry,
            line1: req.body.addressLine1,
            line2: req.body.addressLine2,
            line3: req.body.addressLine3
        }
    };

    console.log(req.body);

    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.applicant
        .update(req.params.id, applicantRequest)
        .then((applicant) => 
            res.redirect('/resources/applicants/'+applicant.id)
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

// Handle applicant delete on GET.
exports.applicant_delete = function(req, res) {
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.applicant
        .delete(req.params.id)
        .then(() => 
            res.redirect('/resources/applicants/')
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