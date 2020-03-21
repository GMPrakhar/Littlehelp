
/**
 * The data handler for Study Material section
 * @type data.js
 */
var data_handler = require('./data');

/**
 * Renders the study page if logged in,
 * redirects to signin if not
 * @param {HttpRequest} req 
 * @param {HttpResponse} res 
 */
function study(req, res)
{
    //Checks if user variable is set in the session
    if(req.session.user)
    {
        res.render('pages/study', {session: req.session.user});
    }
    else
    {
        res.render('pages/signin');
    } 
}

/**
 * Get files from drive for given parent folder
 * @param {HttpRequest} req - The HTTP request
 * @param {HttpResponse} res - The HTTP response
 * @returns JSON response with the file list, and nextPageToken for pagination
 */
function getResults(req,res){
    console.log(req.query);
    var parents = " and";
    var fields = req.query;
    var token = req.query.nextPageToken;
    token = token=='undefined'?null:token;

    // Populate the parents variable with the required sem, branch and type request.
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
    if(parents==" and") parents = "";


    // Get files from the drive using the data handler 
    data_handler.getFilesFromDrive(parents, token,
        (err, result) => {
            if(err) {
                console.log(err);
                res.end('Some error occured');
            }
            else
                res.end(JSON.stringify({files: result.data.files, nextPageToken: result.data.nextPageToken}));
        }
    );

}


/**
 * Updates the views of the file when it is clicked upon
 * @todo Update the value with the current value of file views, not local file views
 */
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
    updateViews
}