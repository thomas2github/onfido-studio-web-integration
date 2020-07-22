const onfido = require('../onfido.js');
const stream = require('stream');
const fs = require('fs');
const { Onfido, OnfidoApiError } = require('@onfido/api');
const { body,sanitizeBody, validationResult } = require('express-validator');

// Display list of all documents for an applicant.
exports.document_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Document list for applicant:' + req.params.id);
};

// Display document upload form.
exports.document_upload = function(req, res) {
    const document = {
        applicant_id: req.params.id
    };
    const sdkTokenRequest = {
        applicantId: req.params.id,
        referrer: 'http://localhost:3000/*'
    };
    const countries = require('../datas/supportedDocumentsByCountry.json');
    onfido.sdkToken.generate( sdkTokenRequest )
        .then((sdkToken) => {
            res.render('documentUpload', { document: document, sdkToken: sdkToken, countries: countries });
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

// Handle document save on POST.
exports.document_save = function(req, res) {
    // Validate fields.
    body('issuingCountry', 'Issuing country must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('type', 'Document type must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('side', 'Document type must not be empty.').trim().isLength({ min: 1 }).escape(),
    
    // Validate file
    body('file').custom((value, { req }) => {
        if (!req.files || Object.keys(req.files).length === 0) {
          throw new Error('File must not be empty.');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),

    req.files.file.mv('./uploads/' + req.files.file.name),
    
    // res.send(JSON.stringify(
    //     {
    //         applicantId: req.params.id, 
    //         issuingCountry: req.body.issuingCountry,
    //         type: req.body.type,
    //         side: req.body.side,
    //         file: fs.createReadStream('./uploads/' + req.files.file.name)
    //     }
    // ));

    onfido.document.upload({
        applicantId: req.params.id, 
        issuingCountry: req.body.issuingCountry,
        type: req.body.type,
        side: req.body.side,
        file: fs.createReadStream('./uploads/' + req.files.file.name)
    })
    .then((document) => 
        res.redirect('/resources/applicants/'+req.applicant_id)
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

// Display detail page for a specific document.
exports.document_show = function(req, res) {
    onfido.document.find(req.params.id)
        .then((document) => {            
            res.render('document', { document: document })
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

// Download a specific document.
exports.document_download = function(req, res) {
    onfido.document.download(req.params.id)
        .then((document) => {
            let fileContents = Buffer.from(document, "base64");
            var readStream = new stream.PassThrough();
            readStream.end(fileContents);

            response.set('Content-disposition', 'attachment; filename="document.txt"');
            response.set('Content-Type', 'text/plain');

            readStream.pipe(response);
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