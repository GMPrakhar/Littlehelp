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


function createFileInDrive(fileMetadata, media, callback){
    jwt.authorize((err, response) => {
      google.drive('v3').files.create({
        auth: jwt,
        resource: fileMetadata,
        media: media,
        fields: 'id'
        }, 
        callback);
    });   
}

exports.createFileInDrive = createFileInDrive;