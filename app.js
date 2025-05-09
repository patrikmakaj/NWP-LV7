var createError = require('http-errors'),
    express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    multer = require('multer'),
    bodyParser = require('body-parser');

var db = require('./model/db'),
    user = require('./model/user'),
    project = require('./model/projects');

var routes = require('./routes/index'),
    register = require('./routes/register'),
    login = require('./routes/login'),
    logout = require('./routes/logout'),
    projects = require('./routes/projects');

var session = require('express-session');
var methodOverride = require('method-override');

var app = express();

//Upotreba session-a
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({
    secret: 'tajna rijec',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/projects', projects);
app.use('/register', register);
app.use('/login', login);
app.use('/logout', logout);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    console.log("poruka");
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
