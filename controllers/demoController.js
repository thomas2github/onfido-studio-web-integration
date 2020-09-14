// const onfido = require('../onfido.js');
const { Onfido, Region, OnfidoApiError } = require('@onfido/api');
const { body,sanitizeBody, validationResult } = require('express-validator');
const { get } = require('request');
const moment = require('moment');
const stream = require('stream');
const fs = require('fs');

exports.docCheckNew = function(req, res) {
    const countries = require('../datas/supportedDocumentsByCountry.json');
    const applicant = {
        firstName: 'SAIF ABDULRAHMAN OBAI',
        lastName: 'ALKAABI'
    };
    res.render('docCheck', { applicant: applicant, countries: countries });
};
exports.docCheckCreate = function(req, res) {
    // Validate fields.
    body('firstName', 'Firstname must not be empty.').trim().isLength({ min: 1 }).escape();
    body('lastName', 'Lastname must not be empty.').trim().isLength({ min: 1 }).escape();
    body('issuingCountry', 'Issuing country must not be empty.').trim().isLength({ min: 1 }).escape();
    body('type', 'Document type must not be empty.').trim().isLength({ min: 1 }).escape();

    let frontToUpload = req.files.front;
    frontToUpload.mv('./uploads/' + frontToUpload.name);
    let backToUpload = req.files.back;
    backToUpload.mv('./uploads/' + backToUpload.name);

    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.applicant
        .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        })
        .then((applicant) => {
            onfido.document
                .upload({
                    applicantId: applicant.id, 
                    issuingCountry: req.body.issuingCountry,
                    type: req.body.type,
                    side: 'front',
                    file: fs.createReadStream('./uploads/' + frontToUpload.name)
                })
                .then((front) => {
                    onfido.document
                        .upload({
                            applicantId: applicant.id, 
                            issuingCountry: req.body.issuingCountry,
                            type: req.body.type,
                            side: 'back',
                            file: fs.createReadStream('./uploads/' + backToUpload.name)
                        })
                        .then((back) => {
                            onfido.check
                                .create({
                                    applicantId: applicant.id,
                                    reportNames: ['document'],
                                    documentsId: [front.id, back.id],
                                    // tags: tags,
                                    // applicantProvidesData: applicantProvidesData,
                                    // asynchronous: asynchronous,
                                    // suppressFormEmail: suppressFormEmail,
                                    // redirectUri: redirectUri
                                    // consider: consider 
                                })
                                .then((check) => 
                                    res.redirect('/check/'+check.id)
                                )
                        })
                })
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

exports.checkResult = function(req, res) {
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });

    onfido.check.find(req.params.id)
        .then((check) => {
            const applicant = onfido.applicant.find(check.applicantId);
            const reports = onfido.report.list(check.id);
            Promise.all([applicant, reports])
                .then((children) => {
                    res.render('checkResult', { check: check, applicant: children[0], reports: children[1] })
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

exports.webSdkConfiguration = function(req, res) {
    const referrer = '*://*/*';
    const sdkTokenRequest = {
        applicantId: '868f363e-df14-42b8-8f9c-e5cf775ee6c5',
        referrer: referrer
    };
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    onfido.sdkToken.generate( sdkTokenRequest )
        .then((sdkToken) => {
            res.render('configSdk', { sdkToken: sdkToken });
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

exports.reportingAndMonitoring = function(req, res) {
    res.render('reportingAndMonitoring', {})
};

exports.report = function(req, res) {
    res.render('report', {})
};

//self-identification
exports.selfIdentification = function(req, res) {
    const step = req.params.step;
    const onfido = new Onfido({
        apiToken: req.session.apiToken
    });
    let message = {};
    let nowRequest;
    let nowResponse;

    switch(step) {
        case 'start': // STEP = start -> clear messages in session
            req.session.messages = [];
            req.session.checkId = null;
            req.session.documentReportId = null;
            req.session.facialSimilarityReportId = null;
            req.session.frontDocumentId = null;
            req.session.backDocumentId = null;
            req.session.frontAutofillData = null;
            
            res.render('selfIdentification', {step: step, messages: req.session.messages});
            break;
        case 'capture': // STEP = capture -> CREATE APPLICANT > GET SDK TOKEN
            nowRequest = moment();
            const applicantRequest = {
                firstName: 'temp',
                lastName: nowRequest
            };
            message = {
                date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                api: 'Create Applicant',
                type: 'REQUEST',
                delai: '',
                data: JSON.stringify(applicantRequest, null, 2)
            };
            req.session.messages.push(message);
            onfido.applicant
                .create(applicantRequest)
                .then((applicant) => {
                    nowResponse = moment();
                    message = {
                        date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                        api: 'Create Applicant',
                        type: 'RESPONSE',
                        delai: nowResponse-nowRequest,
                        data: JSON.stringify(applicant, null, 2)
                    };
                    req.session.messages.push(message);
                    // Get SDK Token
                    req.session.applicantId = applicant.id;
                    const referrer = '*://*/*';
                    const sdkTokenRequest = {
                        applicantId: applicant.id,
                        referrer: referrer
                    };
                    nowRequest = moment();
                    message = {
                        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                        api: 'Get SDK Token',
                        type: 'REQUEST',
                        delai: '',
                        data: JSON.stringify(sdkTokenRequest, null, 2)
                    };
                    req.session.messages.push(message);
                    onfido.sdkToken.generate( sdkTokenRequest )
                        .then((sdkToken) => {
                            nowResponse = moment();
                            message = {
                                date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                api: 'Get SDK Token',
                                type: 'RESPONSE',
                                delai: nowResponse-nowRequest,
                                data: JSON.stringify(sdkToken, null, 2)
                            };
                            req.session.messages.push(message);
                            res.render('selfIdentification', {step: step, messages: req.session.messages, sdkToken: sdkToken});
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
            break;
        case 'check':  
            // create check
            nowRequest = moment();
            const checkRequest = {
                applicantId: req.session.applicantId,
                reportNames: ['document', 'facial_similarity_photo_fully_auto']
            };
            message = {
                date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                api: 'Create Check',
                type: 'REQUEST',
                delai: '',
                data: JSON.stringify(checkRequest, null, 2)
            };
            req.session.messages.push(message);
            console.log('### 1. REQUEST - CREATE CHECK ###');
            onfido.check
                .create(checkRequest)
                .then((check) => {
                    console.log('### 2. RESPONSE - CHECK CREATED: ' + check.id + ' ###');
                    nowResponse = moment();
                    message = {
                        date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                        api: 'Create Check',
                        type: 'RESPONSE',
                        delai: nowResponse-nowRequest,
                        data: JSON.stringify(check, null, 2)
                    };
                    req.session.messages.push(message);

                    req.session.checkId = check.id;
                    // req.session.documentReportId = check.reportIds[1];
                    // req.session.facialSimilarityReportId = check.reportIds[0];

                    //list documents for the applicant
                    nowRequest = moment();
                    const listDocumentsRequest = { applicantId: req.session.applicantId };
                    message = {
                        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                        api: 'Get Documents List',
                        type: 'REQUEST',
                        delai: '',
                        data: JSON.stringify(listDocumentsRequest, null, 2)
                    };
                    req.session.messages.push(message);
                    console.log('### 3. REQUEST - GET DOCUMENTS LIST -> APPLICANT: ' + req.session.applicantId + ' ###');
                    onfido.document
                        .list(req.session.applicantId)
                        .then((documents) => {
                            console.log('### 4. RESPONSE - DOCUMENTS LIST RETRIEVED: ' + documents.length + ' ###');
                            nowResponse = moment();
                            message = {
                                date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                api: 'Get Documents List',
                                type: 'RESPONSE',
                                delai: nowResponse-nowRequest,
                                data: JSON.stringify(documents, null, 2)
                            };
                            req.session.messages.push(message);

                            let frontDocumentIndex = 1;
                            if(documents[0].side == 'front'){
                                req.session.frontDocumentId = documents[0].id;
                                frontDocumentIndex = 0;
                            } else {
                                req.session.backDocumentId = documents[0].id;
                            }
                            if(documents[1].side == 'front'){
                                req.session.frontDocumentId = documents[1].id;
                                frontDocumentIndex = 1;
                            } else {
                                req.session.backDocumentId = documents[1].id;
                            }

                            //front document autofill
                            nowRequest = moment();
                            const autofillRequest = { documentId: documents[frontDocumentIndex].id };
                            message = {
                                date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                api: 'Extract Document Data',
                                type: 'REQUEST',
                                delai: '',
                                data: JSON.stringify(autofillRequest, null, 2)
                            };
                            req.session.messages.push(message);
                            console.log('### 5. REQUEST - EXTRACT DATA WITH AUTOFILL -> DOCUMENT: ' + documents[frontDocumentIndex].id + ' ###');
                            onfido.autofill
                                .perform('0447c217-1cea-4515-bdd6-a8bad8ffeb09') //hack for autofill, paperprint doc can't be classified
                                .then((extractionResult) => {
                                    console.log('### 6. RESPONSE - DATA EXTRACTED -> FIRSTNAME: ' + extractionResult.extractedData.firstName + ' ###');
                                    nowResponse = moment();
                                    message = {
                                        date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                        api: 'Extract Document Data',
                                        type: 'RESPONSE',
                                        delai: nowResponse-nowRequest,
                                        data: JSON.stringify(extractionResult, null, 2)
                                    };
                                    req.session.messages.push(message);
                                    
                                    req.session.frontAutofillData = extractionResult;
                                    
                                    // update applicant
                                    nowRequest = moment();
                                    const applicantRequest = { 
                                        firstName: extractionResult.extractedData.firstName,
                                        lastName: extractionResult.extractedData.lastName
                                    };
                                    message = {
                                        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                        api: 'Update Applicant',
                                        type: 'REQUEST',
                                        delai: '',
                                        data: JSON.stringify(applicantRequest, null, 2)
                                    };
                                    req.session.messages.push(message);
                                    console.log('### 7. REQUEST - UPDATE APPLICANT: ' + req.session.applicantId + ' ###');
                                    onfido.applicant
                                        .update(req.session.applicantId, applicantRequest)
                                        .then((applicant) => {
                                            console.log('### 8. RESPONSE - APPLICANT UPDATED: ' + applicant.id + ' ###');
                                            nowResponse = moment();
                                            message = {
                                                date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                                api: 'Update Applicant',
                                                type: 'RESPONSE',
                                                delai: nowResponse-nowRequest,
                                                data: JSON.stringify(applicant, null, 2)
                                            };
                                            req.session.messages.push(message);
                                            res.render('selfIdentification', {
                                                step: step, 
                                                messages: req.session.messages, 
                                                frontAutofill: req.session.frontAutofillData,
                                                checkId: req.session.checkId
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
            break;
        case 'validation':
            //get check result
            // req.session.checkId = '90df0310-bda3-426e-9371-8376882ade52';
            nowRequest = moment();
            const retrieveCheckRequest = { 
                checkId: req.session.checkId
            };
            message = {
                date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                api: 'Retrieve Check',
                type: 'REQUEST',
                delai: '',
                data: JSON.stringify(retrieveCheckRequest, null, 2)
            };
            req.session.messages.push(message);
            console.log('### 1. REQUEST - RETRIEVE CHECK: ' + req.session.checkId + ' ###');
            onfido.check
                .find(req.session.checkId)
                .then((check) => {
                    console.log('### 2. RESPONSE - CHECK RETIEVED: ' + check.id + ' ###');
                    nowResponse = moment();
                    message = {
                        date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                        api: 'Retrieve Check',
                        type: 'RESPONSE',
                        delai: nowResponse-nowRequest,
                        data: JSON.stringify(check, null, 2)
                    };
                    req.session.messages.push(message);
                    
                    //retrieve 1st report
                    nowRequest = moment();
                    const retrieveReportRequest = { 
                        reportId: check.reportIds[0]
                    };
                    message = {
                        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                        api: 'Retrieve Report',
                        type: 'REQUEST',
                        delai: '',
                        data: JSON.stringify(retrieveReportRequest, null, 2)
                    };
                    req.session.messages.push(message);
                    console.log('### 3. REQUEST - RETRIEVE FIRST REPORT: ' + check.reportIds[0] + ' ###');
                    onfido.report
                        .find(check.reportIds[0])
                        .then((firstReport) => {
                            console.log('### 4. RESPONSE - FIRST REPORT RETRIEVED: ' + firstReport.id + ' ###');
                            nowResponse = moment();
                            message = {
                                date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                api: 'Retrieve Report',
                                type: 'RESPONSE',
                                delai: nowResponse-nowRequest,
                                data: JSON.stringify(firstReport, null, 2)
                            };
                            req.session.messages.push(message);

                            //retrieve 2nd report
                            nowRequest = moment();
                            const retrieveReportRequest = { 
                                reportId: check.reportIds[1]
                            };
                            message = {
                                date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                api: 'Retrieve Report',
                                type: 'REQUEST',
                                delai: '',
                                data: JSON.stringify(retrieveReportRequest, null, 2)
                            };
                            req.session.messages.push(message);
                            console.log('### 5. REQUEST - RETRIEVE SECOND REPORT: ' + check.reportIds[1] + ' ###');
                            onfido.report
                                .find(check.reportIds[1])
                                .then((secondReport) => {
                                    console.log('### 6. RESPONSE - SECOND REPORT RETRIEVED: ' + secondReport.id + ' ###');
                                    nowResponse = moment();
                                    message = {
                                        date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                                        api: 'Retrieve Report',
                                        type: 'RESPONSE',
                                        delai: nowResponse-nowRequest,
                                        data: JSON.stringify(secondReport, null, 2)
                                    };
                                    req.session.messages.push(message);

                                    //Render
                                    res.render('selfIdentification', {
                                        step: step, 
                                        messages: req.session.messages, 
                                        check: check,
                                        firstReport: firstReport,
                                        secondReport: secondReport
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
            break;
        case 'success':
            res.render('selfIdentification', {step: step, messages: req.session.messages});
            break;
        default:
            res.render('selfIdentification', {step: step, messages: req.session.messages});
            break;
    }
};