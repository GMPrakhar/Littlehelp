var express = require('express');
var join = require('path').join;

var router = new express.Router();

var index = require('./index');

router.use(express.static(__dirname + '../../views'));

// views is directory for all template files

router.get('/admin', index.index);
router.get('/fileList', index.listFiles);
router.get('/folderList', index.listFolders);
router.get('/enableViewPermissions', index.enableViewPermissions);
router.get('/createFolder', index.createFolder);
router.get('/deleteFile', index.deleteFile);
router.get('/contributors', index.displayContributors);

module.exports = router;