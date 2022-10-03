// Require the package
const axios = require('axios');
const onfido_axios = require('../apis/onfido');

// Display login page.
exports.getLogin = function(req, res) {
    //delete session
    req.session.destroy();
    res.render('login', {  });
};

exports.postLogin = function(req, res) {
    const onfido_token = req.body.apiToken;
    const onfido_env = req.body.environment;

    onfido_axios.defaults.baseURL = onfido_env;
    onfido_axios.defaults.headers.common['Authorization'] = 'Token token='+onfido_token;

    onfido_axios.get('/applicants?page=0&perPage=1').then((response) => {
        //save Token in session
        req.session.onfido_api_token = onfido_token,
        req.session.onfido_api_environment = onfido_env,

        //redirect to dashboard
        res.redirect('/index')
    })
    .catch((error) => {
        console.log(error.message);
        // TODO: manage environment error versus token error
        res.render('login', { invalid: 'invalid' });
    });
};

exports.logout = function(req, res) {
    //delete session
    req.session.destroy();
    //redirect to login
    res.redirect('/login');
};