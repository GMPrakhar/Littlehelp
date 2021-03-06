var data_handler = require('./data')

function index(request, response) {
    if(request.query.pass == "@Humteen3"){
      response.render("pages/admin");
    }else{
      response.end("Invalid Passcode entered!");
    }
    
}

function listFiles(req, res){
    var parent = req.query.parent?req.query.parent:'root';

    data_handler.listAllFiles(parent, (err, result) => {
        if(err) res.end(err);
        else
        res.end(JSON.stringify({files: result.data.files}));
    });
}

function listFolders(req, res){
    var parent = req.query.parent?req.query.parent:'root';
    
    data_handler.listAllFolders(parent, (err, result) => {
        console.log(err);
        if(err) res.end(err);
        else
        res.end(JSON.stringify({folders: result.data.files}));
    });
}

function enableViewPermissions(req, res){
    var permissions = 
        {
        'role': 'reader',
        'type': 'anyone'
        };
    
    data_handler.createViewPermissions(permissions,  function(err, resp){
        if(err) console.log(err);
        else res.end("Permission id:" + resp.id);
    });
}


function createFolder(req, res){
    var name = req.query.name;
    var parent = req.query.parent?req.query.parent:'root';
    var fileMetadata = {
        name: name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parent]
    };

    data_handler.createFolder(fileMetadata, function (err2, file) {
        if (err2) {
        // Handle error
        console.error(err2);
        } else {
        //console.lo('Created Id: ', file);
        res.end(file.id);
        }
    });
}


function deleteFile(req, res){
    var id = req.query.id;

    data_handler.deleteFile(id, function (err2, resp) {
        if (err2) {
            // Handle error
            console.error(err2);
            res.end("Some error occured");
        } else {
            console.log('Deleted Id: ');
            res.end("Deleted file  ");
        }
    });
}

function displayContributors(req,res){
    res.render("pages/contributors");
}

module.exports = {
    index,
    listFiles,
    listFolders,
    enableViewPermissions,
    displayContributors,
    deleteFile,
    createFolder
}