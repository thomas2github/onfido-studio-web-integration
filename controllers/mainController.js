const { Onfido, Region } = require('@onfido/api');
const moment = require('moment');
const axios = require('axios');
const { get } = require('request');
const { use } = require('../routes/mainRouter');


// GLOBAL
exports.index = function(req, res, next) {
    axios.defaults.baseURL = req.session.environment;
    axios.defaults.headers.common['Authorization'] = 'Token token='+req.session.apiToken;
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.headers.put['Content-Type'] = 'application/json';
    req.session.url = req.originalUrl;
    const applicant = (req.session.applicant)?req.session.applicant:null;
    if(applicant){
        res.redirect('/applicants/'+applicant.id);
    }
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    // console.log(process.env);
    res.render('index', { applicant: applicant, stacktrace: stacktrace});
};

exports.launcher = function(req, res, next) {
    req.session.url = req.originalUrl;

    // Create new applicant
    const firstname = 'John';
    const lastname = 'Doe';
    // const street = (req.body.street !== '')?req.body.street:'';
    // const town = (req.body.town !== '')?req.body.town:'';
    // const postcode = (req.body.postcode !== '')?req.body.postcode:'';
    // const country = (req.body.country !== '')?req.body.country:'';
    const dataCreateApplicant = { first_name: firstname, last_name: lastname};
    // const data = { first_name: firstname, last_name: lastname, address: { street: street, town: town, postcode: postcode, country: country } };
    axios.default.post('/applicants/', dataCreateApplicant).then((response) => {
        const applicant = response.data;

         // Create sdk
         const dataCreateSdk = { applicant_id: applicant.id };
         axios.default.post('/sdk_token/', dataCreateSdk).then((response) => {
            const sdkToken = response.data.token;

            // Create workflow_run
            const worflowId = '90bca929-28b5-486d-bfb4-bb1f8a4e4e81';
            const dataCreateWorkflowRun = { applicant_id: applicant.id, workflow_id: workflowId };
            axios.default.baseURL = 'https://api.onfido.com/v4/';
            axios.default.post('/workflow_runs/', dataCreateWorkflowRun).then((response) => {
                const workflowRun = response.data;
                res.render('launcher', { sdkToken: sdkToken, workflowRunId: workflowRun.id });            
            })
            .catch((error) => {console.log(error.message);next(error);});
         })
         .catch((error) => {console.log(error.message);next(error);});
    })
    .catch((error) => {console.log(error.message);next(error);});
};
