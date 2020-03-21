const chai = require("chai");
const expect = chai.expect;
const sinon = require('sinon');
// import our getIndexPage function
const indexPage = require("../../app/study_material/index.js");

describe("Get Study Material Page", function() {

  it("should render study material page with user info if user is logged in", function() {
    let req = {session:{user:{name: "prak"}}}
    let res = {
      render: sinon.spy()
    }

    indexPage.study(req, res)
    expect(res.render.firstCall.args[0]).to.equal('pages/study');
    expect(res.render.firstCall.args[1]).not.to.be.undefined;
  });

  it("should redirect to login page if user is not logged in", function() {
    let req = {session:{}}
    let res = {
      render: sinon.spy()
    }

    indexPage.study(req, res)
    expect(res.render.firstCall.args[0]).to.equal('pages/signin');
    expect(res.render.firstCall.args[1]).to.be.undefined;
  });

});

describe("Get Study material based on parameters", function(){

    it("should return a JSON string with appropriate response if no error occur.", function(){
        err = undefined;
        res = {
            data : {files : {name : "file1"}, nextPageToken : undefined},
            end: sinon.spy()
        }

        indexPage.getFilesFromDriveHandler(err, res);

        try{
            var result = JSON.parse(res.end.firstCall.args[0]);
            expect(result.files).not.to.be.undefined;
        }catch(e){
            console.log(e);
            expect(e).to.be.undefined;
        }
    });

    
    it("should return a Error message as response if any error occurs.", function(){
        err = "Connection Timeout. Host did not respond";
        res = {
            data : {files : {name : "file1"}, nextPageToken : undefined},
            end: sinon.spy()
        }

        indexPage.getFilesFromDriveHandler(err, res);
        expect(res.end.firstCall.args[0]).to.be.equal("Some error occured");
    });
    
});