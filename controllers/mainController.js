const { Onfido, Region } = require('@onfido/api');
const moment = require('moment');
const axios = require('axios');
const { get } = require('request');
const { use } = require('../routes/mainRouter');

exports.index = function(req, res, next) {
    axios.defaults.baseURL = req.session.environment;
    axios.defaults.headers.common['Authorization'] = 'Token token='+req.session.apiToken;
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.headers.put['Content-Type'] = 'application/json';
    req.session.url = req.originalUrl;
    res.render('index');
};

exports.clearSession = function(req, res, next) {
    req.session.applicant = null;
    req.session.applicants = [];
    req.session.stacktrace = [];
    req.session.documents = [];
    req.session.photos = [];
    req.session.videos = [];
    req.session.check = null;
    req.session.reports = [];
    req.session.checks = [];
    req.session.extraction = null;
    req.session.url = null;
    req.session.usecase = null;
    req.session.current_index = null;
    res.redirect('/index');
};

exports.launcher = function(req, res, next) {
    req.session.url = req.originalUrl;

    // Create new applicant
    const firstname = 'John';
    const lastname = 'Doe';
    const dataCreateApplicant = { first_name: firstname, last_name: lastname};
    axios.default.post('/applicants/', dataCreateApplicant).then((response) => {
        const applicant = response.data;

         // Create sdk
         const dataCreateSdk = { applicant_id: applicant.id };
         axios.default.post('/sdk_token/', dataCreateSdk).then((response) => {
            const sdkToken = response.data.token;

            // Create workflow_run
            const workflowId = (req.body.workflowId != '')?req.body.workflowId:null;
            const dataCreateWorkflowRun = { applicant_id: applicant.id, workflow_id: workflowId };
            axios.defaults.baseURL = 'https://api.onfido.com/v4/';
            axios.default.post('/workflow_runs/', dataCreateWorkflowRun).then((response) => {
                const workflowRun = response.data;

                // load default custom data
                const customUI = require("../data/customUI.json");
                const customLanguage = require("../data/customLanguage.json");

                res.render('launcher', { sdkToken: sdkToken, workflowRunId: workflowRun.id, customUI: customUI, customLanguage: customLanguage });            
            })
            .catch((error) => {console.log(error.message);next(error);});
         })
         .catch((error) => {console.log(error.message);next(error);});
    })
    .catch((error) => {console.log(error.message);next(error);});
};
