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

function listAllFiles(parent, callback){
    jwt.authorize((err, response) => {
        google.drive('v3').files.list(
        {
            auth: jwt,
            q: "mimeType!='application/vnd.google-apps.folder' and '"+parent+"' in parents"
        },
        callback
        );
    });
}

function listAllFolders(parent, callback){
    jwt.authorize((err, response) => {
        google.drive('v3').files.list(
        {
            auth: jwt,
            q: "mimeType='application/vnd.google-apps.folder' and '"+parent+"' in parents"
        },
        callback
        );
    });
}

function createViewPermissions(permissions, callback){
    jwt.authorize((err, response) => {
        google.drive('v3').permissions.create({
            auth: jwt,
            resource: permissions,
            fileId: '1ibYfFvJwMSlBOgfnRfRJgLycExpLnsNk',
            fields: 'id'
        },
        callback);
    });
}

function createFolder(fileMetadata, callback){
    jwt.authorize((err, response) => {
        drive.files.create({
            auth: jwt,
            resource: fileMetadata,
            fields: 'id',
        }, callback);
    });
}

function deleteFile(id, callback){
    jwt.authorize((err, response) => {
        drive.files.delete({
            auth: jwt,
            fileId: id 
        }, callback);
    });
}

module.exports = 
{
    listAllFiles,
    listAllFolders,
    createViewPermissions,
    createFolder,
    deleteFile
}