
var data_handler = require('./data');

function study(req, res)
{
    if(req.session.user)
    {
        res.render('pages/study', {session: req.session.user});
    }
    else
    {
        res.render('pages/signin');
    } 
}


function getResults(req,res){
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


    // Get files from the drive using the data handler 

    data_handler.getFilesFromDrive(parents, token, getFilesFromDriveHandler);

}

function getFilesFromDriveHandler(err, result){
    if(err) {
        console.log(err);
        res.end('Some error occured');
    }
    else
        res.end(JSON.stringify({files: result.data.files, nextPageToken: result.data.nextPageToken}));
}


function updateViews(req, res){
    let views = parseInt(req.query.currentViews);
    let fileId = req.query.fileId;
    console.log(views);

    // Update the views of the file on drive

    data_handler.updateViewsOfFile(fileId, views,
        (err, result)=>{
            if(err) console.log(err);
            console.log(result);
            res.end();
        }
    );
}

module.exports = {
    study,
    getResults,
    getFilesFromDriveHandler,
    updateViews
}