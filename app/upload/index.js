
var data_handler = require('./data');
var formidable = require('formidable');
var fs = require('fs');

function upload_view(request, response) {
  if(process.env.environment == "local"){
    request.session.user = {
      userId : 1
    }
  }
    if(request.session.user || process.env.environment != "Production") response.render('pages/upload', {session: request.session.user});
    else response.render('pages/signin');
}

function uploadFile(req, res){
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
      properties: {
        sem: fields.actsem, branch: fields.actbr, type: fields.acttype, uploader: uploader,
        subject: subject, userId: userId, topic: topic, year: year, views: views, mst: mst,
        material_name: material_name, timestamp: timestamp
      }
    };
    
    console.log(fileMetadata);
    var media = {
      mimeType: files.filetoupload.type,
      body: fs.createReadStream(files.filetoupload.path)
    };

    data_handler.createFileInDrive(fileMetadata, media,
      function (err2, file) {
        if (err2) {
            // Handle error
            console.error(err2);
            res.end('There was some problem with the upload, please try again later');
        } else {
          res.write('File uploaded');
          res.end();
        }
      }
    );
  });
}

module.exports = {
    upload_view,
    uploadFile
}
  