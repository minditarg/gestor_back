// server.js
// set up ======================================================================
// get all the tools we need
var path = require('path');
if (process.env.NODE_ENV == 'production')
  require('dotenv').config({ path: path.join(__dirname, 'vars', '.env.production') })
else
  require('dotenv').config({ path: path.join(__dirname, 'vars', '.env') });
var compression = require('compression');
var cors = require('cors');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var path = require('path');
var morgan = require('morgan');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', client => {
  console.log("cliente conectado");
  client.on('disconnect', () => { console.log("cliente desconectado") });
});
var port = process.env.PORT || 3600;

var passport = require('passport');
var flash = require('connect-flash');

var mysql = require('mysql');

var connection = mysql.createPool({
  acquireTimeout: process.env.DB_AQUIRETIMEOUT,
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port:process.env.DB_PORT,
  timezone : "+00:00",
  dateStrings:true
})

var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer();
var serverOne = process.env.URL_PROXY;



// configuration ===============================================================
// connect to our database

require('./config/passport')(passport, connection); // pass passport for configuration


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.use(cors());
// set up our express application
app.use(compression());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)


app.set('view engine', 'ejs'); // set up ejs for templating
app.set('trust proxy', 1);
// required for passport
app.use(session({
  secret: 'vidyapathaisalwaysrunning',
  resave: false,
  saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

if (process.env.NODE_ENV == 'production')
  app.use(express.static('build'));

  app.use('/' + process.env.UPLOAD_PATH, express.static(process.env.UPLOAD_PATH));
app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
})
// routes ======================================================================
//require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

require('./app/routesUsers.js')(app, connection, passport, io);
require('./app/routesPages.js')(app, connection, passport);
require('./app/routesItemsMenu.js')(app, connection, passport);
require('./app/routesMultimedia.js')(app, connection, passport);
require('./app/routesModules.js')(app, connection, passport);
require('./app/routesNoticias.js')(app, connection, passport);
require('./app/routesPersonal.js')(app, connection, passport);
require('./app/routesHospital.js')(app, connection, passport);
//require('./app/routesVideoteca.js')(app, connection, passport);

/////////////////////
//para development
if (process.env.NODE_ENV != 'production') {

  app.all("/*", function (req, res) {

    apiProxy.web(req, res, { target: serverOne }, function (e) {
      return res.status(500).send({
        error: true,
        message: e.message
      })
    })
  });

} else {

  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });


}


server.listen(port);
console.log('MindIT en el puerto ' + port);
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node docs)
})
