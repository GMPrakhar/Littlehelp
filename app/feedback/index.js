var data_handler = require('./data')

function feedbackFromUser(req, res){
    data_handler.writeFeedback(req.query, function(err){
        if(err) {
          console.log(err);
          res.end('There was some error with the submission!');
        }
        res.end('Thank you, your feedback was succesfully submitted!');
    });
}

  
function showFeedbacks(req, res){
    data_handler.showFeedbacks(function(err, data){
        if(err) console.log(err);
        res.end(data);
    });
}
  
module.exports = {
    feedbackFromUser,
    showFeedbacks
}