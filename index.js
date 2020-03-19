
var express = require('express');
var app = express();
var fs = require('fs');
var environment = require('dotenv');
const session = require('express-session');
var formidable = require('formidable');
const { google } = require('googleapis');
var APIS = require('./apis')(app)

app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret: 'littlehelp123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: 1800000 },

}))

environment.config();



app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



// Allow only https connections
// Comment this function if you are using on localhost

// app.get('*', function(req, res, next) {  
//   console.log(req.secure);
//   if(!req.secure)
//     res.redirect('https://' + req.headers.host + req.url);
//   else
//     next();
// })

// Configure Routes to all the components using their respective routers

app.use(require('./app/site/router'));

app.use(require('./app/study_material/router'));

app.use(require('./app/upload/router'));

app.use(require('./app/feedback/router'));

app.use(require('./app/admin/router'))


// For increasing time on the site, to be implemented in future releases

app.get('/driver', function(request, response) {
  response.render('pages/driver');
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


