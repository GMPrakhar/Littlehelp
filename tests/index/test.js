var assert = require('assert');
var chai = require('chai')
var chaiHttp = require('chai-http');
var expect = chai.expect;
var should = chai.should();

chai.use(chaiHttp);

var index = require('./index');

describe('Routing', function () {
  
  it('should redirect to https if request is http', function (done) {
      chai.request('http://localhost:5000').get('/').then(function(res){
        expect(res).to.redirect;
        done();
      }).catch(done);
  }); 
});