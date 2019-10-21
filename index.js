var express = require('express');
var app = express();
var fs = require('fs');
var formidable = require('formidable');
const { google } = require('googleapis')
const key = require("./credentials.json");
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

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/upload', function(request, response) {
  response.render('pages/upload');
});


app.get('/study', function(request, response) {
  response.render('pages/study');
});


app.get('/driver', function(request, response) {
  response.render('pages/driver');
});

app.get('/signin', function(request,response){
	response.render('pages/signin');
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
      var year = fields.year?fields.year:"2019";
      var views = fields.views?fields.views:0;
      var mst = fields.mst?fields.mst:[];
      console.log(parents);
      var fileMetadata = {
        'name': files.filetoupload.name,
        parents: parents,
        properties: {sem: fields.actsem, branch: fields.actbr, type: fields.acttype, uploader: uploader,
        subject: subject, userId: userId, topic: topic, year: year, views: views, mst: mst
      }
        
      };
      
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
        } else {
          console.log('Uploaded File Id: ', file);
        }
      });
      });

      res.write('File uploaded');
      res.end();
    });
});


app.get('/getResults', function(req,res){
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
      console.log(parents);
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
      console.log('Created Id: ', file);
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












