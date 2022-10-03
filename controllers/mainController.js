const { Onfido, Region } = require('@onfido/api');
const moment = require('moment');
const axios = require('axios');
const { get } = require('request');
const { use } = require('../routes/mainRouter');
const onfido_axios = require('../apis/onfido');
const onfido_v4_axios = require('../apis/onfidoV4');

exports.index = function(req, res, next) {
    req.session.url = req.originalUrl;
    res.render('index');
};

exports.clearSession = function(req, res, next) {

    res.redirect('/index');
};

exports.launcher = function(req, res, next) {
    req.session.url = req.originalUrl;

    req.session.language = (req.body.language)?req.body.language:'FR';
    const transaction_amount = (req.body.amount)?parseInt(req.body.amount):15

    // Create new applicant
    const dataApplicant = require("../data/dataApplicant.json");
    onfido_axios.post('/applicants/', dataApplicant).then((response) => {
        const applicant = response.data;

         // Create sdk
         const dataCreateSdk = { applicant_id: applicant.id };
         onfido_axios.post('/sdk_token/', dataCreateSdk).then((response) => {
            const sdkToken = response.data.token;

            // Create workflow_run
            const workflowId = '64e15697-976a-49c5-96bf-8de8ff3c15ca';
            const dataCreateWorkflowRun = { 
                applicant_id: applicant.id, 
                workflow_id: workflowId,
                custom_data: {
                    transaction_amount: transaction_amount
                } 
            };
            // const workflowId = 'cef74530-b9a3-47ed-b9c5-e566772410f0';
            // const dataCreateWorkflowRun = { 
            //     applicant_id: applicant.id, 
            //     workflow_id: workflowId
            // };
            onfido_v4_axios.defaults.headers.common['Authorization'] = 'Token token='+req.session.onfido_api_token;
            onfido_v4_axios.post('/workflow_runs/', dataCreateWorkflowRun).then((response) => {
                const workflowRun = response.data;

                // load default custom data
                const customUI = require("../data/customUI.json");
                const customLanguage = require("../data/customLanguage.json");

                res.render('launcher', { sdkToken: sdkToken, workflowRunId: workflowRun.id, customUI: customUI, customLanguage: customLanguage, language: req.session.language });            
            })
            .catch((error) => {console.log(error.message);next(error);});
         })
         .catch((error) => {console.log(error.message);next(error);});
    })
    .catch((error) => {console.log(error.message);next(error);});
};
