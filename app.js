var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require("passport")
var bodyParser = require('body-parser');

var isAuthenticated = require('./helper/isAuthenticated')

var auth      = require('./routes/auth')
var character = require('./routes/character')
var error     = require('./routes/error')
var logout    = require('./routes/logout')
var news      = require('./routes/news')
var profile   = require('./routes/profile')
var stories   = require('./routes/stories')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(isAuthenticated)

app.use('/character', character)
app.use('/profile', profile)
app.use('/stories', stories)
app.use('/logout', logout)
app.use('/auth', auth)
app.use('/', news)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(error)

module.exports = app;
