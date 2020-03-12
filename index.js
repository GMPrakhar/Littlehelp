var express = require('express');
var app = express();
var fs = require('fs');
var environment = require('dotenv');
const session = require('express-session');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'littlehelp123',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: 1800000 },

}))

var formidable = require('formidable');
const { google } = require('googleapis')
let key = require("./credentials.json");

environment.config();

key.private_key_id = process.env.drive_private_key_id
key.private_key = process.env.drive_private_key.replace(/\\n/g, '\n')
key.client_id = process.env.drive_client_id
const scopes = 'https://www.googleapis.com/auth/drive';
const jwt = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  scopes
);
let drive = google.drive('v3');

var APIS = require('./apis')(app)

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



// Allow only https connections
app.get('*', function(req, res) {  
  console.log(req.secure);
  if(!req.secure)
    res.redirect('https://' + req.headers.host + req.url);
})


app.get('/', function(request, response) {
  response.render('pages/index');
});


app.get('/contact', function(request, response) {
  response.render('pages/contact');
});

app.get('/upload', function(request, response) {
  if(request.session.user) response.render('pages/upload', {session: request.session.user});
  else response.render('pages/signin');
});


app.get('/study', function(request, response) {
 // request.session.user = "temp";
  if(request.session.user) response.render('pages/study', {session: request.session.user});
  else response.render('pages/signin');
});


app.get('/driver', function(request, response) {
  response.render('pages/driver');
});

app.get('/signin', function(request,response){
	response.render('pages/signin');
});

app.get('/feedback', function(req, res){
  fs.readFile('feedback.txt', "utf8", function(err, data){
    data = JSON.parse(data);
    data.push(req.query);
    fs.writeFile('feedback.txt', JSON.stringify(data), function(err){
      if(err) {
        console.log(err);
        res.end('There was some error with the submission!');
      }
      res.end('Thank you, your feedback was succesfully submitted!');
    });
  });
});

app.get('/getFeedbacks', function(req, res){
  fs.readFile('feedback.txt', "utf8", function(err, data){
    res.end(data);
  });
});

app.post('signin', function(request,response){
	// Manage Authentication With JWT
});

      
app.post('/uploadFile', function(req, res){
  var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var parents = [];
      if(fields.sem != "any") parents.push(fields.sem);
      if(fields.branch != "any") parents.push(fields.branch);
      if(fields.type != "any") parents.push(fields.type);
      var subject = fields.subject?fields.subject:"";
      var uploader = fields.uploader?fields.uploader:"Littlehelp Team";
      var userId = fields.userId?fields.userId:"1";
      var topic = fields.topic?fields.topic:"";
      var year = fields.year?fields.year:new Date().getFullYear().toString();
      var views = fields.views?fields.views:0;
      var material_name = fields.material_name?fields.material_name:files.filetoupload.name;
      var mst = [];
      if(fields.mst1) mst.push(fields.mst1);
      if(fields.mst2) mst.push(fields.mst2);
      if(fields.mst3) mst.push(fields.mst3);
      if(fields.end) mst.push(fields.end);
      mst = mst.toString();

      console.log(fields);

      var timestamp = fields.timestamp?fields.timestamp:"Unknown";
      var fileMetadata = {
        'name': files.filetoupload.name,
        parents: parents,
        properties: {sem: fields.actsem, branch: fields.actbr, type: fields.acttype, uploader: uploader,
        subject: subject, userId: userId, topic: topic, year: year, views: views, mst: mst,
        material_name: material_name, timestamp: timestamp
      }
        
      };
      
      console.log(fileMetadata);
      var media = {
        mimeType: files.filetoupload.type,
        body: fs.createReadStream(files.filetoupload.path)
      };


      jwt.authorize((err, response) => {
        
      drive.files.create({
        auth: jwt,
        resource: fileMetadata,
        media: media,
        fields: 'id'
      }, function (err2, file) {
        if (err2) {
          // Handle error
          console.error(err2);
          res.end('There was some problem with the upload, please try again later');
        } else {
      //    console.log('Uploaded File Id: ', file);
          res.write('File uploaded');
          res.end();
        }
      });
      });

    });
});


app.get('/updateViews', function(req, res){
  let views = parseInt(req.query.currentViews);
  let fileId = req.query.fileId;
  console.log(views);
  jwt.authorize((err, response) => {
    google.drive('v3').files.update({
      auth: jwt,
      fileId: fileId,
      resource: {properties: {views: views+1}}
    }, (err, result)=>{
      if(err) console.log(err);
      console.log(result);
      res.end();
    });
  });
});


app.get('/getResults', function(req,res){
  console.log(req.query);
  var parents = " and";
  var fields = req.query;
  var token = req.query.nextPageToken;
  token = token=='undefined'?null:token;
      if(fields.sem != 'undefined' && fields.sem != "any"){
        parents += " '"+fields.sem + "' in parents ";
      }
      if(fields.branch != 'undefined' && fields.branch != "any"){
        if(parents != " and") parents += "and ";
        parents += " '"+fields.branch + "' in parents ";
      }
      if(fields.type != 'undefined' && fields.type != "any"){
        if(parents != " and") parents += "and ";
        parents += " '"+fields.type + "' in parents ";
      }
      //console.lo(parents);
      if(parents==" and") parents = "";
  jwt.authorize((err, response) => {
    google.drive('v3').files.list(
      {
        auth: jwt,
        q: "mimeType!='application/vnd.google-apps.folder' " + parents,
        pageToken: token,
   //     q: "properties has { key='subject' and value=''}",
        fields: "files(name, id, properties, createdTime, webViewLink), nextPageToken"
      },
      (err, result) => {
        if(err) {
          console.log(err);
          res.end('Some error occured');
        }
        else
        res.end(JSON.stringify({files: result.data.files, nextPageToken: result.data.nextPageToken}));
      }
    );
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});








//-------------------------Admin Panel---------------------------

app.get('/admin', function(request, response) {
  if(request.query.pass == "@Humteen3"){
    response.render("pages/admin");
  }else{
    response.end("Invalid Passcode entered!");
  }
  
});

app.get('/fileList', function(req, res){
  var parent = req.query.parent?req.query.parent:'root';
  
  jwt.authorize((err, response) => {
    google.drive('v3').files.list(
      {
        auth: jwt,
        q: "mimeType!='application/vnd.google-apps.folder'"
      },
      (err, result) => {
        if(err) res.end(err);
        else
        res.end(JSON.stringify({files: result.data.files}));
      }
    );
  });
});

app.get('/folderList', function(req, res){
  var parent = req.query.parent?req.query.parent:'root';
  jwt.authorize((err, response) => {
    google.drive('v3').files.list(
      {
        auth: jwt,
        q: "mimeType='application/vnd.google-apps.folder' and '"+parent+"' in parents"
      },
      (err, result) => {
        console.log(err);
        if(err) res.end(err);
        else
        res.end(JSON.stringify({folders: result.data.files}));
      }
    );
  });
});

app.get('/enableViewPermissions', function(req, res){
  var permissions = 
    {
      'role': 'reader',
      'type': 'anyone'
    }
  ;
  jwt.authorize((err, response) => {
    google.drive('v3').permissions.create({
      auth: jwt,
      resource: permissions,
      fileId: '1ibYfFvJwMSlBOgfnRfRJgLycExpLnsNk',
      fields: 'id'
    }, function(err, resp){
      if(err) console.log(err);
      else res.end("Permission id:" + resp.id);
    });
});
});


app.get('/createFolder', function(req, res){
  var name = req.query.name;
  var parent = req.query.parent?req.query.parent:'root';
  var fileMetadata = {
    name: name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parent]
  };jwt.authorize((err, response) => {
  drive.files.create({
    auth: jwt,
    resource: fileMetadata,
    fields: 'id',
  }, function (err2, file) {
    if (err2) {
      // Handle error
      console.error(err2);
    } else {
      //console.lo('Created Id: ', file);
      res.end(file.id);
    }
  });
  });
});


app.get('/deleteFile', function(req, res){
  var id = req.query.id;
  jwt.authorize((err, response) => {
  drive.files.delete({
    auth: jwt,
    fileId: id 
  }, function (err2, resp) {
    if (err2) {
      // Handle error
      console.error(err2);
      res.end("Some error occured");
    } else {
      console.log('Deleted Id: ');
      res.end("Deleted file  ");
    }
  });
  });
});

app.get('/contributors',function(req,res){
  res.render("pages/contributors");
});












