var express = require('express');
var join = require('path').join;

var router = new express.Router();

var index = require('./index');

router.use(express.static(__dirname + '../../views'));

// views is directory for all template files
router.get('/feedback', index.feedbackFromUser);
router.get('/getFeedbacks', index.showFeedbacks);

module.exports = router;