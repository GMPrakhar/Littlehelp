const admin = require('firebase-admin');
const serviceAccount = require('./littlehelp-1234-firebase-adminsdk-d12hl-0f753c3350.json');
const functions = require('firebase-functions');

admin.initializeApp({
    credential : admin.credential.cert(serviceAccount)
})

let db = admin.firestore();
var p = 10;

const { exec } = require('child_process');
const { Client } = require('pg');

var client;

/*
function updateDBuri(){
    exec('heroku config:get DATABASE_URL -a littlehelp', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        process.env.DATABASE_URL = stdout;
    });    
}
*/

    //process.env.DATABASE_URL = serviceAccount.heroku_db_uri;

function deleteUser(userEmail){
    let userRef = db.collection('users').doc(userEmail).delete();

    msg = {};
    msg.result = 'success';
    msg.msg = userEmail+" successfully deleted.";
    console.log(JSON.stringify(msg));
}

function checkValidity(key, value, constraints, allowedValues, msg, paramList){

    if(value == null){
        msg.msg = "req Object has missing "+key+" parameter.";
        console.log(msg.msg);
        msg.result = 'failure';
        msg.paramList = paramList;
        return msg;
    }

    if(constraints == "true"){
        var belong = 0;
        for(var i=0; i<allowedValues.length; i++){
            if(value == allowedValues[i]){
                belong = 1;
                break;
            }
        }
        if(belong==0){
            msg.msg = key+" in the req object contains the value ("+value+") that are not allowed.";
            console.log(msg.msg);
            msg.result = 'failure';
            msg.paramList = paramList;
            return msg;
        }
    }

    return msg;
}

module.exports = function(app){

    app.get('/login', function(req,res){
        var msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;
        msg.data = req.query;
        /*
            expected req paramaeter key
            : userID
            : userName
            : userEmail
            : userImageURL
            : userBranch
            : userAdmYear
            : userContact
            : userLastSeen
        */

        paramList = [{'userID':'required'},{'userEmail':'required'},'userName','userImageURL','userBranch','userAdmYear','userContact','userLastSeen'];

        console.log("registerUser : following user registration request initiated : ");
        console.log(req.query);

        // check whether api passed userID and userEmail
        if(req.query.userID == null){
            console.log("req Object has missing userID parameter.");
            msg.result = 'failure';
            msg.login = "false";
            msg.paramList = paramList;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        if(req.query.userEmail == null){
            console.log("req Object has missing userEmail parameter.");
            msg.result = 'failure';
            msg.login = "false";
            msg.paramList = paramList;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }

        if(req.query.userName == null) req.query.userName = "";
        if(req.query.userContact == null) req.query.userContact = "";
        if(req.query.userImageURL == null) req.query.userImageURL = "";
        if(req.query.userBranch == null) req.query.userBranch = "";
        if(req.query.userAdmYear == null) req.query.userAdmYear = "";
        if(req.query.userLastSeen == null) req.query.userLastSeen = "";


        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });

        client.connect();

        //Q = "INSERT INTO users VALUES('234','mail.govind.c@gmail.com','Govind Choudhary','9879088575','gv.lh.com','CS','2016','2019-11-14 17:34:09')";
        Q = "SELECT * FROM users WHERE userid = '"+req.query.userID+"' AND useremail = '"+req.query.userEmail+"' ";
        console.log("checking existing on users...!!!");
        console.log(Q);

        client.query(Q, (err, Qres) => {

            try{
                if (err) throw err;
            }catch(err){
                console.log(err);
                msg.result = "failure";
                msg.login = "false";
                msg.msg = err;
                res.write(JSON.stringify(msg));
                client.end();
                res.end();
                return;
            }

            rowCount = Qres.rows.length;

            if(rowCount==1){
                msg.result = "success";
                msg.login = "true";
                msg.msg = Qres;
                res.write(JSON.stringify(msg));
                res.end();
                return;
            }

            QI = "INSERT INTO users VALUES('"+req.query.userID+"','"+req.query.userEmail+"','"+req.query.userName+"','"+req.query.userContact+"','"+req.query.userImageURL+"','"+req.query.userBranch+"','"+req.query.userAdmYear+"','"+req.query.userLastSeen+"')";
            console.log("registering user...!!!");
            console.log(QI);
            client.query(QI, (errI, QresI) => {

                try{
                    if (errI) throw errI;
                }catch(errI){
                    console.log(errI);
                    msg.result = "failure";
                    msg.login = "false";
                    msg.msg = errI;
                    res.write(JSON.stringify(msg));
                    client.end();
                    res.end();
                    return;
                }
    
                rowCount = Qres.rows.length;
        
                if(rowCount==1 || 1){
                    client.end();
                    msg.result = "success";
                    msg.login = "true";
                    msg.msg = Qres;
                    res.write(JSON.stringify(msg));
                    res.end();
                    return;
                }
            });
        });

    });

    app.get('/updateUser', function(req,res){
        var msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;
        msg.data = req.query;
        /*
            expected req paramaeter key
            : userID
            : userName
            : userEmail
            : userImageURL
            : userBranch
            : userAdmYear
            : userContact
            : userLastSeen
        */

        paramList = [{'userID':'required'},{'userEmail':'required'},'userName','userImageURL','userBranch','userAdmYear','userContact','userLastSeen'];

        console.log("registerUser : following user registration request initiated : ");
        console.log(req.query);

        // check whether api passed userID and userEmail
        if(req.query.userID == null){
            console.log("req Object has missing userID parameter.");
            msg.result = 'failure';
            msg.login = "false";
            msg.paramList = paramList;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        if(req.query.userEmail == null){
            console.log("req Object has missing userEmail parameter.");
            msg.result = 'failure';
            msg.login = "false";
            msg.paramList = paramList;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }

        Q = "UPDATE users SET ";

        if(req.query.userName != null) Q += "username = '"+req.query.userName+"',";
        if(req.query.userContact != null) Q += "usercontact = '"+req.query.userContact+"',";
        if(req.query.userImageURL != null) Q += "userimageurl = '"+req.query.userImageURL+"',";
        if(req.query.userBranch != null) Q += "userbranch = '"+req.query.userBranch+"',";
        if(req.query.userAdmYear != null) Q += "useradmyear = '"+req.query.userAdmYear+"',";
        if(req.query.userLastSeen != null) Q += "userlastseen = '"+req.query.userLastSeen+"',";

        Q += "useremail = '"+req.query.userEmail+"'";
        Q += "WHERE useremail = '"+req.query.userEmail+"'";

        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
    
        console.log(process.env.DATABASE_URL);
        client.connect();

        msg.Query = Q;
        console.log("\n"+Q+"\n");

        client.query(Q, (err, Qres) => {

            try{
                if (err) throw err;
            }catch(err){
                console.log(err);
                msg.result = "failure";
                msg.msg = err;
                res.write(JSON.stringify(msg));
                res.end();
                return;
            }

            rowCount = Qres.rows.length;

            client.end();
            msg.result = "success";
            msg.msg = Qres;
            res.write(JSON.stringify(msg));
            res.end();
            return;            

        });

    });


    {
    /********* Firebase API's No more userful */
    
    // // Register Come User login
    // app.get('/FregisterUser', function(req, res){

    //     var msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;

    //     msg.data = req.query;
    //     /*
    //         expected req paramaeter key
    //         : usedID
    //         : userName
    //         : userEmail
    //         : userImageURL
    //         : userBranch
    //         : userAdmYear
    //         : userContact
    //         : userLastSeen
    //     */

    //     paramList = [{'usedID':'required'},{'userEmail':'required'},'userName','userImageURL','userBranch','userAdmYear','userContact','userLastSeen'];

    //     console.log("registerUser : following user registration request initiated : ");
    //     console.log(req.query);

    //     // check whether api passed userID and userEmail

    //     if(req.query.userID == null){
    //         console.log("req Object has missing userID parameter.");
    //         msg.result = 'failure';
    //         msg.login = "false";
    //         msg.paramList = paramList;
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     if(req.query.userEmail == null){
    //         console.log("req Object has missing userEmail parameter.");
    //         msg.result = 'failure';
    //         msg.login = "false";
    //         msg.paramList = paramList;
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }

    //     // check whether user already exists
    //     let usersRef = db.collection('users');
    //     let query = usersRef.where('userEmail','==',req.query.userEmail).get()
    //     .then(snapshot => {
    //         if(snapshot.empty){

    //             let usersIDRef = db.collection('users');
    //             let queryID = usersIDRef.where('userID','==',req.query.userID).get()
    //             .then(snapshotID => {
    //                 if(snapshotID.empty){
    //                     console.log("No matching document with userEmail : "+req.query.userEmail+" and userID : "+req.query.userID);
    //                     console.log("proceeding current request with newUserRegistration.");
    //                     let docRef = db.collection('users').doc(req.query.userEmail);
    //                     let setDoc = docRef.set(
    //                         req.query
    //                     );
        
    //                     msg.login = "true";
    //                     msg.result = 'success';
    //                     msg.msg = "New User Successfully Registered and Signed in Successfully.";
        
    //                     console.log(msg);
    //                     console.log(msg.msg);
        
    //                     res.write(JSON.stringify(msg));
    //                     //res.write("user successfully registered.");
    //                     res.end();
    //                     return;        
    //                 }else{
    //                     msg.login = "false";
    //                     msg.result = 'failure';
    //                     msg.msg = "the userID already exists in database but not with the passed userEmail alongwith.";

    //                     console.log(msg);
    //                     console.log("something not usual.");
    //                     console.log(msg.msg);
    //                     res.write(JSON.stringify(msg));
    //                     res.end();
    //                     return;    
    //                 }
    //             })
    //             .catch(err => {
    //                 console.log('Error getting ID documents : ', err);
    //             });
    //         }

    //         let ss = 0;
    //         snapshot.forEach(doc =>{
    //             ss++;
    //             console.log(doc.id,'=>',doc.data());
                
    //             if(doc.data().userID === req.query.userID && doc.data().userEmail === req.query.userEmail){
    //                 msg.login = "true";
    //                 msg.result = 'success';
    //                 msg.msg = "Already existing user signedin successfully.";
    //                 console.log(msg);
    //                 console.log(msg.msg);
    //                 res.write(JSON.stringify(msg));
    //                 res.end();
    //                 return;
    //             }else{
    //                 msg.login = "false";
    //                 msg.result = 'failure';
    //                 msg.msg = "the userEmail already exists in database but not with the passed userID alongwith.";
    //                 console.log(msg);
    //                 console.log(msg.msg);
    //                 res.write(JSON.stringify(msg));
    //                 res.end();
    //                 return;
    //             }
                
    //         });
    //     })
    //     .catch(err => { 
    //         console.log('Error getting documents : ', err);
    //     });
    // });

    // // Update user details
    // app.get('/FupdateUser', function(req,res){
    //     msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;
    //     req.query.userID = "";
    //     delete req.query.userID;

    //     let docRef = db.collection("users").doc(req.query.userEmail);
    //     let updateSingle = docRef.update(req.query);

    //     console.log(req.query);

    //     msg.update = req.query;
    //     msg.result = "success";

    //     res.write(JSON.stringify(msg));
    //     res.end();
    // });

    // // Delete a Particular User
    // app.get('/FdeleteUser', function(req, res){
    //     msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;

    //     msg.data = req.query;
    //     paramList = [{'userEmail':'required'}];

    //     console.log("deleteUser : following user about to be deleted");
    //     console.log(req.query);

    //     // check whether api passed with userEmail
    //     if(req.query.userEmail == null){
    //         console.log("req Object has missing userEmail parameter.");
    //         msg.result = 'failure';
    //         msg.paramList = paramList;
    //         msg.msg;
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }

    //     let userRef = db.collection('users').doc(req.query.userEmail).delete();
    //     msg.result = 'success';
    //     msg.msg = req.query.userEmail+" successfully deleted.";
    //     res.write(JSON.stringify(msg));
    //     res.end();
    // });

    // // Delete All Users at once
    // app.get('/FdeleteAllUsers', function(req, res){
    //     msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;

    //     console.log("warning all user documents are about to be deleted.");
    //     let userREF = db.collection("users").get()
    //      .then(snapshot=>{
    //          if(snapshot.empty){
    //             msg.msg = "collection users is empty";
    //             console.log(msg);
    //             res.write(JSON.stringify(msg));
    //             res.end();
    //             return;
    //          }

    //          snapshot.forEach(doc=>{
    //             deleteUser(doc.id);
    //             console.log(doc.id+" deleted");
    //          });

    //          msg.msg = "All Users Successfully Deleted.";
    //          msg.result = "success";
    //          res.write(JSON.stringify(msg));
    //          res.end();
    //          return;

    //      })
    //      .catch(err => {
    //         msg.msg = 'Error traversing users : ', err;
    //         console.log(msg);
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     });
    // });

    // // Add a Study Material
    // app.get('/FaddStudyMaterial', function(req, res){
    //     var msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;

    //     msg.data = req.query;

    //     paramList = [
    //         {'userEmail':'required'},
    //         {'userName':'required'},
    //         {'sem':'required'},
    //         {'branch':'required'},
    //         {'type':'required'},
    //         {'subject':'required'},
    //         {'materialName':'required'},
    //         {'topic':'optional'},
    //         {'resourceType':['drive','url']},
    //         {'resourceLocation':'required'},
    //         {'timestamp':'required'},
    //         {'views':'optional'}
    //     ];

    //     extraInfo = [
    //         {'timestamp':'format(yyyy-mm-dd-HH:MM:SS)'},
    //         {'sample_request':'http://localhost:5000/addStudyMaterial?passcode=passcode&userEmail=aa1&sem=1&branch=cs&type=notes&subject=ADA&materialName=pdf1.jpg&resourceType=url&resourceLocation=google.com&timestamp=2019-10-21-18-32-00'}
    //     ];

    //     console.log("addStudyMaterial : following studyMaterial upload request initiated : ");
    //     console.log(req.query);

    //     // check whether api passed important parameters
    //     for(var i=0; i<paramList.length; i++){
    //         let k = Object.keys(paramList[i])[0];
    //         let v = Object.values(paramList[i])[0];

    //         //console.log("k = "+k+" v = "+v);
    //         if(v == "optional") continue;
    //         if(v == "required"){
    //             var z = checkValidity(k,req.query[k],"false","",msg,paramList);
    //             if(z.result == "failure"){
    //                 z.extraInfo = extraInfo;
    //                 res.end(JSON.stringify(z));
    //                 return;
    //             }
    //         }else{
    //             var z = checkValidity(k,req.query[k],"true",v,msg,paramList);
    //             if(z.result == "failure"){
    //                 z.extraInfo = extraInfo;
    //                 res.end(JSON.stringify(z));
    //                 return;
    //             }
    //         }
    //     }

    //     if(req.query.views == null){
    //         req.query.views = 0;
    //     }

    //     if(req.query.resourceType == "drive"){
    //         let docRef = db.collection('studymaterial').doc("drive_"+req.query.resourceLocation).set(
    //             req.query
    //         ).then(ref=>{
    //             msg.result = "success";
    //             msg.materialID = ref.id;
    //             res.end(JSON.stringify(msg));
    //             return;
    //         })
    //         .catch(err => {
    //             msg.result = "failure";
    //             msg.msg = "some error occured while adding material on firestore : "+err;
    //             res.end(JSON.stringify(msg));
    //             return;
    //         });    
    //     }

    //     if(req.query.resourceType == "url"){
    //         let docRef = db.collection('studymaterial').add(
    //             req.query
    //         ).then(ref=>{
    //             msg.result = "success";
    //             msg.materialID = ref.id;
    //             res.end(JSON.stringify(msg));
    //             return;
    //         })
    //         .catch(err => {
    //             msg.result = "failure";
    //             msg.msg = "some error occured while adding material on firestore : "+err;
    //             res.end(JSON.stringify(msg));
    //             return;
    //         });
    //     }
        
    // });

    // // Increment View on Material
    // app.get('/FincrementStudyMaterialViews', function(req,res){
    //     msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;

    //     msg.data = req.query;
    //     paramList = [{'studyMaterialID':'required'}];

    //     console.log("incrementStudyMaterialViews : checking and incrementing views for following material");
    //     console.log(req.query);

    //     // check whether api passed with userEmail
    //     if(req.query.studyMaterialID == null){
    //         console.log("req Object has missing studyMaterialID parameter.");
    //         msg.result = 'failure';
    //         msg.paramList = paramList;
    //         msg.msg;
    //         res.end(JSON.stringify(msg));
    //         return;
    //     }

    //     let docRef = db.collection('studymaterial').doc(req.query.studyMaterialID);
    //     let getDoc = docRef.get()
    //      .then(doc=> {
    //         if(!doc.exists){
    //             msg.result = "failure";
    //             msg.msg = "there doesn't exist any material with studyMaterialID : "+req.query.studyMaterialID;
    //             res.end(JSON.stringify(msg));
    //         }else{
    //             let views = doc.data().views;
    //             views++;
    //             let updateDoc = docRef.update({
    //                 'views' : views
    //             });

    //             msg.result = "success";
    //             msg.studyMaterialID = doc.id;
    //             msg.updatedMaterial = doc.data();
    //             msg.updatedMaterial.views = views;
    //             res.end(JSON.stringify(msg));
    //             return;
    //         }
    //      })
    //      .catch(err=> {
    //         msg.result = "failure";
    //         msg.msg = "some error occured while sending request to firestore : "+err;
    //         res.end(JSON.stringify(msg));
    //     });

    // });

    // // Update Study Material
    // app.get('/FupdateStudyMaterial', function(req,res){
    //     msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;

    //     msg.data = req.query;
    //     paramList = [{'studyMaterialID':'required'}];

    //     console.log("incrementStudyMaterialViews : checking and incrementing views for following material");
    //     console.log(req.query);

    //     // check whether api passed with userEmail
    //     if(req.query.studyMaterialID == null){
    //         console.log("req Object has missing studyMaterialID parameter.");
    //         msg.result = 'failure';
    //         msg.paramList = paramList;
    //         msg.msg;
    //         res.end(JSON.stringify(msg));
    //         return;
    //     }

    //     let newUpdate = req.query;
    //     let studyMaterialID = req.query.studyMaterialID;
    //     delete newUpdate.studyMaterialID;
    //     msg.data.studyMaterialID = studyMaterialID;

    //     let docRef = db.collection('studymaterial').doc(studyMaterialID);
    //     let updateStudyMaterial = docRef.update(
    //         newUpdate
    //     )
    //      .then(doc => {
    //         msg.result = "success";
    //         msg.studyMaterialID = doc.id;
    //         let updatedDoc = docRef.get()
    //          .then(newdoc => {
    //             console.log("doc.data() "+newdoc.data());
    //             msg.updatedMaterial = newdoc.data();
    //             msg.msg = "Study Material Updated Successfully.";
    //             res.end(JSON.stringify(msg));
    //             return;
    //          })
    //          .catch(err => {
    //             msg.result = "failure";
    //             msg.msg = "some error occured while fetching updated Study Material form firestore : "+err;
    //             res.end(JSON.stringify(msg));
    //             return;
    //         });
    //      })
    //      .catch(err => {
    //         msg.result = "failure";
    //         msg.msg = "some error occured while sending request to firestore : "+err;
    //         res.end(JSON.stringify(msg));
    //         return;
    //     });

    // });

    // // Search A Study Material
    // app.get('/FsearchStudyMaterial', function(req,res){
    //     msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.write(JSON.stringify(msg));
    //         res.end();
    //         return;
    //     }
    //     delete req.query.key;

    //     msg.data = req.query;
    //     paramList = [
    //         {'searchDrive':['true','false']},
    //         {'searchMaterialWithURL':['true','false']},
    //         {'sem':'optional'},
    //         {'branch':'optional'},
    //         {'type':'optional'},
    //         {'subject':'optional'},
    //         {'topic':'optional'},
    //         {'materialName':'optional'}
    //     ];

    //     // check whether api passed important parameters
    //     for(var i=0; i<paramList.length; i++){
    //         let k = Object.keys(paramList[i])[0];
    //         let v = Object.values(paramList[i])[0];

    //         //console.log("k = "+k+" v = "+v);
    //         if(v == "optional") continue;
    //         if(v == "required"){
    //             var z = checkValidity(k,req.query[k],"false","",msg,paramList);
    //             if(z.result == "failure"){
    //                 z.extraInfo = extraInfo;
    //                 res.end(JSON.stringify(z));
    //                 return;
    //             }
    //         }else{
    //             var z = checkValidity(k,req.query[k],"true",v,msg,paramList);
    //             if(z.result == "failure"){
    //                 z.extraInfo = extraInfo;
    //                 res.end(JSON.stringify(z));
    //                 return;
    //             }
    //         }
    //     }

    //     msg.paramList = paramList;

    //     console.log("searchStudyMaterial : searching Study Material with following demand");
    //     console.log(req.query);

    //     let smRef = db.collection('studymaterial');
    //     var searchQuery = smRef;

    //     if(req.query.searchDrive == "true" && req.query.searchMaterialWithURL == "true"){
            
    //     }else if(req.query.searchDrive == "false" && req.query.searchMaterialWithURL == "true"){
    //         searchQuery = searchQuery.where("resourceType", '==' , "url");

    //     }else if(req.query.searchDrive == "true" && req.query.searchMaterialWithURL == "false"){
    //         searchQuery = searchQuery.where("resourceType", '==' , "drive");

    //     }

    //     if(req.query.sem != null){
    //         searchQuery = searchQuery.where("sem", '==' , req.query.sem);
    //     }
    //     if(req.query.branch != null){
    //         searchQuery = searchQuery.where("branch", '==', req.query.branch);
    //     }
    //     if(req.query.type != null){
    //         searchQuery = searchQuery.where("type", '==' , req.query.type);
    //     }
    //     if(req.query.subject != null){
    //         searchQuery = searchQuery.where("branch", '==', req.query.subject);
    //     }
    //     if(req.query.topic != null){
    //         searchQuery = searchQuery.where("topic", '==' , req.query.topic);
    //     }
    //     if(req.query.materialName != null){
    //         searchQuery = searchQuery.where("materialName", '==', req.query.materialName);
    //     }

    //     let searchResult = searchQuery/*.orderBy('views','desc').orderBy('timestamp','desc')*/.get()
    //      .then(snapshot => {
    //         if(snapshot.empty) {
    //             msg.result = "success";
    //             msg.materialCount = 0;
    //             msg.msg = "No Study Material Found with requested Query.";
    //             console.log(msg.msg);
    //             res.end(JSON.stringify(msg));
    //             return;
    //         }

    //         msg.searchResult = [];
    //         msg.materialCount = 0;
    //         snapshot.forEach(doc => {
    //             let m = doc.data();
    //             m.studyMaterialID = doc.id;
    //             console.log(doc.id, "==> ", m);
    //             msg.searchResult.push(m);
    //             msg.materialCount++;
    //         });
    //         msg.result = "success";
    //         res.end(JSON.stringify(msg));
    //         return;
    //      })
    //      .catch(err => {
    //         msg.result = "failure";
    //         msg.msg = "some error occured while performing the search : "+err;
    //         console.log(msg.msg);
    //         res.end(JSON.stringify(msg));
    //         return;
    //     });

    // });

    // app.get('/FtopContributors', function(req,res){
    //     msg = {};

    //     if(!(req.query.key===serviceAccount.littlehelp_key)){
    //         msg.msg = "Invalid Secret Parameter";
    //         msg.result = "failure";
    //         res.end(JSON.stringify(msg));
    //         return;
    //     }
    //     delete req.query.key;

    //     msg.data = req.query;

    //     msg.contributors = [];
    //     contributors = {};

    //     let collRef = db.collection('studymaterial').get()
    //      .then(snapshot => {
    //         if(snapshot.empty){
    //             msg.msg = "No Study Material in Database.";
    //             msg.result = "Success";
    //             res.end(JSON.stringify(msg));
    //             return;
    //         }

    //         snapshot.forEach(doc => {
    //             let currUserEmail = doc.data().userEmail;

    //             if(contributors[currUserEmail] == null){
    //                 contributors[currUserEmail] = 1;
    //             }else{
    //                 contributors[currUserEmail]++;
    //             }
                
    //             //console.log(doc.id," ==> ",doc.data());
    //         });

    //         // Create items array
    //         var items = Object.keys(contributors).map(function(key) {
    //             return [key, contributors[key]];
    //         });
            
    //         // Sort the array based on the second element
    //         items.sort(function(first, second) {
    //             return second[1] - first[1];
    //         });

    //         var cArr = [];
    //         var process = 0;
    //         var itemMap = {};

    //         for(var i=0; i<items.length; i++){
    //             itemMap[items[i][0]] = i;
    //             console.log(items[i][0]);
    //             let userRef = db.collection('users').doc(items[i][0]).get()
    //              .then(doc =>{

    //                 let cObj = {};
    //                 cObj.contributorDetail = doc.data();
    //                 cObj.contributorID = doc.id;

    //                 var j=itemMap[doc.id];
    //                 cObj.contributionCount = items[j][1];

    //                 /*
    //                 for(j=0; j<items.length; j++){
    //                     if(doc.id == items[j][0]){
    //                         break;
    //                     }
    //                 }

    //                 if(j<items.length){
    //                     cObj.contributionCount = items[j][1];
    //                 }
    //                 */

    //                 console.log(cObj);
    //                 cArr.push(cObj);
    //                 process++;

    //                 if(process == items.length){
    //                     //console.log(items);
    //                     msg.contributors = cArr;
    //                     msg.result = "success";
    //                     res.end(JSON.stringify(msg));
    //                     return;
    //                 }
            
    //              })
    //              .catch(err =>{
    //                 console.log("err => ",err);
    //             });
    //         }
    //      })
    //      .catch(err => {
    //         msg.msg = "Some error while processing topContributors : "+err;
    //         msg.result = "Success";
    //         res.end(JSON.stringify(msg));
    //         return;
    //     });
    // });
    
    }
}