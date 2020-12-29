// Require the package
const axios = require('axios');

// Display login page.
exports.getLogin = function(req, res) {
    //delete session
    req.session.destroy();
    res.render('login', {  });
};

exports.postLogin = function(req, res) {
    const token = req.body.apiToken;
    //test API Token
    axios.defaults.baseURL = 'https://api.onfido.com/v3/';
    axios.defaults.headers.common['Authorization'] = 'Token token='+token;
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.default.get('/applicants?page=0&perPage=1').then((response) => {
        //save Token in session
        req.session.apiToken = token,
        req.session.stacktrace = [],
        //redirect to dashboard
        res.redirect('/index')
    })
    .catch((error) => {
        console.log(error.message);
        res.render('login', { invalid: 'invalid' });
    });
};

exports.logout = function(req, res) {
    //delete session
    req.session.destroy();
    //redirect to login
    res.redirect('/login');
};