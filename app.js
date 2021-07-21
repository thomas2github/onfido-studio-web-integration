require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const mainRouter = require('./routes/mainRouter');

let app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "secret f0r TGA dem0 @pp",
  resave: true,
  saveUninitialized: true
}));



app.use('/', mainRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  const applicant = (req.session.applicant)?req.session.applicant:null;
  const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
  const applicants = (req.session.applicants)?req.session.applicants:[];
  const documents = (req.session.documents)?req.session.documents:[];
  const photos = (req.session.photos)?req.session.photos:[];
  const videos = (req.session.videos)?req.session.videos:[];
  // TODO: update with new media object type
  // const video_documents = (req.session.video_documents)?req.session.video_documents:[];
  res.render('error', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos});
  // TODO: update with new media object type
  // res.render('error', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, video_documents: video_documents});
});

module.exports = app;
