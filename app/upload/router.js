var express = require('express');
var join = require('path').join
var router = new express.Router()

var index = require('./index');

router.use(express.static(__dirname + '../../views'));

// views is directory for all template files
router.get('/upload', index.upload_view);
router.post('/uploadFile', index.uploadFile); 

module.exports = router