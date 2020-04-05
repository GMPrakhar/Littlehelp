var assert = require('assert');
var chai = require('chai')
var chaiHttp = require('chai-http');
var expect = chai.expect;
var should = chai.should();

var environment = require('dotenv');
environment.config();

chai.use(chaiHttp);

var index = require('../../index');

describe('Routing', function () {
  
  it('should redirect to https if request is http', function (done) {
    console.log(process.env.environment);
      chai.request('http://localhost:5000').get('/').then(function(res){
        if(process.env.environment == "Production") expect(res).to.redirect;
        else expect(res).status(200);
        done();
      }).catch(done);
  }); 
});