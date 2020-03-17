var express = require('express');
var join = require('path').join

var router = new express.Router()


function home(req, res)
{
    res.render('site/index')
}

function contact(req, res)
{
    res.render('site/contact')
}

function signinView(request,response){
	response.render('pages/signin');
}

function signin(request,response){
	// Manage Authentication With JWT
}


router.use(express.static(__dirname + '../../views'));

// views is directory for all template files
router.get('/', home);
router.get('/contact', contact);
router.get('/signin', signinView);
router.post('/signin', signin);

module.exports = router