var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
var redis = require('async-redis').createClient();
var MySQLDB = require('./models/mysqldb.js');
const phin = require('phin').defaults({'method': 'get', 'headers': { 'User-Agent': 'evehu' }})

var indexRouter = require('./routes.js');

var app = express();

app.root = __dirname;
app.redis = redis;
app.mysql = new MySQLDB({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'evehu'
});
app.phin = phin;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async function(req, res, next) {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  let now = Date.now();
  now = now - (now % 1000);
  let key = 'ip:' + ip + ':' + now;

  res.app.redis.incr(key);
  res.app.redis.expire(key, 1000);
  
  let access = Number.parseInt(await res.app.redis.get(key));
  if (access > 10) {
    res.sendStatus(429);
  } else {
    next();
  }
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);

  if (req.accepts('html')) {
    res.render('404')
    return;
  } else if (req.accepts('json')) {
    res.json({error: '404 Not found'})
  }

  // next(createError(404));
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
