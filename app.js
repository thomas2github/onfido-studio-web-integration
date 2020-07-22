require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const fileUpload = require('express-fileupload');

const indexRouter = require('./routes/index');
const resourcesRouter = require('./routes/resources');
const usersRouter = require('./routes/users');
const reportsRouter = require('./routes/reports');
const usecasesRouter = require('./routes/usecases');

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

app.use(fileUpload({
  // useTempFiles : true,
  // tempFileDir : '/tmp/',
  // safeFileNames: true, 
  // preserveExtension: true,
  createParentPath: true
}));

app.use('/', indexRouter);
app.use('/resources', resourcesRouter);
app.use('/users', usersRouter);
app.use('/reports', reportsRouter);
app.use('/usecases', usecasesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;