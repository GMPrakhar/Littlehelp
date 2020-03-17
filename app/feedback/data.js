
var fs = require('fs');

function writeFeedback(feedback, callback){
    fs.readFile('feedback.txt', "utf8", function(err, data){
        data = JSON.parse(data);
        data.push(feedback);
        fs.writeFile('feedback.txt', JSON.stringify(data), callback);
      });
}

function showFeedbacks(callback){
    fs.readFile('feedback.txt', "utf8", callback);
}

module.exports = {
    writeFeedback,
    showFeedbacks
}