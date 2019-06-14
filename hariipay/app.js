const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash= require('connect-flash');
const configDataBase = require("./config/database");
const passport = require('passport');
const cors = require('cors');
const favicon = require('serve-favicon')
const methodOverride = require("method-override");
const expressValidator = require('express-validator');
const hbsHelpers = require("./helpers/hbs-helpers");
require('./config/passport');

const sessionStore = new MongoStore({url : configDataBase.mongoDbUrl , autoReconnect : true});

const app = express();


app.use(cors());
//Middleware for validator
app.use(expressValidator({
  errorFormatter :( _param , msg ) => msg
}));
app.engine('.hbs', expressHbs({defaultLayout: 'layout', helpers: hbsHelpers, extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve fonts , favicon.ico and public 
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));

app.use(session({
  secret: 'edwindiaz123ilovecoding',
  resave: true,
  saveUninitialized: true,
  store : sessionStore
}));

// check is user choose rememberMe
app.use(function(req, res, next) {
  if( new Date() < new Date(req.session.cookie.expires)) {
    req.logout();
  };
  next();
});

app.use(flash());
//methodOverride midleware
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
  res.locals.success_message = req.flash('success_message');
  res.locals.msg = req.flash('msg');
  res.locals.error_message = req.flash('error_message');
  res.locals.form_errors = req.flash('form_errors');
  res.locals.error = req.flash('error');
  
  res.locals.user = req.user || null;  
  next()
});


// use router
app.use('/', require('./routes/home/index'));
app.use('/product', require('./routes/home/product'));
app.use('/home/comment', require('./routes/home/comment'));
app.use('/admin', require('./routes/admin/index'));
app.use('/admin/products', require('./routes/admin/products'));
app.use('/admin/category', require('./routes/admin/category'));
app.use('/admin/user', require('./routes/admin/user'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// render error
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

// mongoose connect
mongoose.connect(configDataBase.mongoDbUrl ,{ useNewUrlParser: true } )
.then( () => console.log(`mongoose connect to [${configDataBase.mongoDbUrl}]`))

// listen
app.listen(3000 , () => console.log('server run in  http://localhost:3000') )


module.exports = app;
