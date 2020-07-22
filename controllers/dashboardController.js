const onfido = require('../onfido.js');
const { Onfido, Region, OnfidoApiError } = require('@onfido/api');
const { get } = require('request');

// Display dashboard.
exports.dashboard = function(req, res) {
    let checks = [];
    const getChecks = async applicant => {
        return onfido.check.list(applicant.id)
            .then(applicantChecks => applicantChecks.map(check => checks.push(check)))
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
    }
    onfido.applicant
        .list()
        .then((applicants) => {
            Promise.all(
                applicants.map(applicant => getChecks(applicant))
            ).then(() => {
                //sort checks and keep last X checks
                const latestChecks = checks
                    .sort((a,b) => {
                        if (a.createdAt && b.createdAt) {
                            return new Date(b.createdAt) - new Date(a.createdAt)
                        }
                        else if (a.createdAt && !b.createdAt) {
                            return 1
                        }
                        else {
                            return -1
                        }
                    })
                    .slice(0,5);
                
                latestChecks.map(check => check.applicant = applicants.find(applicant => applicant.id === check.applicantId));
                
                res.render('dashboard', { lastestChecks: latestChecks });
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
