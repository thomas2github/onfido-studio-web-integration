// const onfido = require('../onfido.js');
const { Onfido, Region, OnfidoApiError } = require('@onfido/api');

// Display list of all check for an applicant.
exports.check_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Check list for applicant:' + req.params.id);
};

// Display check create form.
exports.check_new = function(req, res) {
    let check = {};
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    const applicant = onfido.applicant.find(req.params.id);
    const documents = onfido.document.list(req.params.id);
    Promise.all([applicant, documents])
        .then((children) => {
            res.render('checkForm', { check: check, applicant: children[0], documents: children[1] })
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

// Handle check create on POST.
exports.check_create = function(req, res) {
   
    // Validate fields.
    // body('firstName', 'Firstname must not be empty.').trim().isLength({ min: 1 }).escape(),

    const reportNames = [];
    const documentsId = [];
    for (const propertyName of Object.getOwnPropertyNames(req.body)) {
        if(propertyName.startsWith('report')){ reportNames.push(req.body[propertyName]) }
        if(propertyName.startsWith('doc')){ documentsId.push(req.body[propertyName]) }
    }
    const tags = [];
    tags.push(req.body.tags);
    const applicantProvidesData = (req.body.applicantProvidesData)?true:false;
    const asynchronous = (req.body.applicantProvidesData && req.body.asynchronous)?true:false;;
    const suppressFormEmail = (req.body.applicantProvidesData && req.body.suppressFormEmail)?true:false;;
    const redirectUri = (req.body.applicantProvidesData && req.body.redirectUri)?req.body.redirectUri:'';
    const consider = [];

    // res.send(JSON.stringify(req.body)+JSON.stringify(reportsName)+JSON.stringify(documentsId)+JSON.stringify(tags)+JSON.stringify(applicantProvidesData)+JSON.stringify(asynchronous)+JSON.stringify(suppressFormEmail));
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.check
        .create({
            applicantId: req.params.id,
            reportNames: reportNames,
            documentsId: documentsId,
            tags: tags,
            applicantProvidesData: applicantProvidesData,
            asynchronous: asynchronous,
            suppressFormEmail: suppressFormEmail,
            // redirectUri: redirectUri
            // consider: consider 
        })
        .then((check) => 
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

// Display detail page for a specific check.
exports.check_show = function(req, res) {
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.check.find(req.params.id)
        .then((check) => {
            const applicant = onfido.applicant.find(check.applicantId);
            const reports = onfido.report.list(check.id);
            Promise.all([applicant, reports])
                .then((children) => {
                    res.render('check', { check: check, applicant: children[0], reports: children[1] })
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