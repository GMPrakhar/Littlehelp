let key = require("../../credentials.json");

key.private_key_id = process.env.drive_private_key_id;
key.private_key = process.env.drive_private_key.replace(/\\n/g, '\n');
key.client_id = process.env.drive_client_id;

const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/drive';
const jwt = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  scopes
);


function getFilesFromDrive (parents, token, callback){
    jwt.authorize((err, response) => {
        google.drive('v3').files.list(
        {
            auth: jwt,
            q: "mimeType!='application/vnd.google-apps.folder' " + parents,
            pageToken: token,
            fields: "files(name, id, properties, createdTime, webViewLink), nextPageToken"
        }, callback);
    });
}


// Warning : This implementation is subject to incorrect view updation because
// it only increments the already fetched views

function updateViewsOfFile (fileId, views, callback){
    jwt.authorize((err, response) => {
        google.drive('v3').files.update({
          auth: jwt,
          fileId: fileId,
          resource: {properties: {views: views+1}}
        }, callback);
    });
}

exports.getFilesFromDrive = getFilesFromDrive;
exports.updateViewsOfFile = updateViewsOfFile;