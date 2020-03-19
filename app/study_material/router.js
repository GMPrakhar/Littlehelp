var express = require('express');
var join = require('path').join;
var router = new express.Router()

var index = require('./index');

router.use(express.static(__dirname + '../../views'));

router.get('/study', index.study);
router.get('/getResults', index.getResults);
router.get('/updateViews', index.updateViews);

module.exports = router