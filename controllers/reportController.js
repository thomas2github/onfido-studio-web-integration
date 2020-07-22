const onfido = require('../onfido.js');
const { Onfido, Region, OnfidoApiError } = require('@onfido/api');

// Display list of all reports for a check.
exports.report_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Report list for check:' + req.params.id);
};

// Display detail page for a specific report.
exports.report_show = function(req, res) {
    onfido.report.find(req.params.id)
        .then((report) => {
            res.render('report', { report: report });
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