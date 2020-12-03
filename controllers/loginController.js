// Require the package
const { Onfido, Region, OnfidoApiError } = require('@onfido/api');

// Display login page.
exports.getLogin = function(req, res) {
    //delete session
    req.session.destroy();
    res.render('login', {  });
};

exports.postLogin = function(req, res) {
    const token = req.body.apiToken;
    //test API Token
    const onfido = new Onfido({
        apiToken: token
    });
    onfido.applicant
        .list({ page: 0, perPage: 1, includeDeleted: false})
        .then((applicants) => {
            //save Token in session
            req.session.apiToken = token,
            req.session.stacktrace = [],
            //redirect to dashboard
            res.redirect('/index')
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
            res.render('login', { invalid: 'invalid' });
        })
};

exports.logout = function(req, res) {
    //delete session
    req.session.destroy();
    //redirect to login
    res.redirect('/login');
};