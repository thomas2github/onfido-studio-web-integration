module.exports = (req, res, next) => {
  if(req.session.onfido_api_token){
    return next();
  } else {
    const err = new Error('invalid API token!');
    err.status = 400;
    res.redirect('/login');
    return next(err);
  }
};
