const admin = require('firebase-admin');
const serviceAccount = require('./littlehelp-1234-firebase-adminsdk-d12hl-0f753c3350.json');
const functions = require('firebase-functions');

admin.initializeApp({
    credential : admin.credential.cert(serviceAccount)
})

let db = admin.firestore();

var p = 10;

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

    // Register Come User login
    app.get('/registerUser', function(req, res){

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
            : usedID
            : userName
            : userEmail
            : userImageURL
            : userBranch
            : userAdmYear
            : userContact
            : userLastSeen
        */

        paramList = [{'usedID':'required'},{'userEmail':'required'},'userName','userImageURL','userBranch','userAdmYear','userContact','userLastSeen'];

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

        // check whether user already exists
        let usersRef = db.collection('users');
        let query = usersRef.where('userEmail','==',req.query.userEmail).get()
        .then(snapshot => {
            if(snapshot.empty){

                let usersIDRef = db.collection('users');
                let queryID = usersIDRef.where('userID','==',req.query.userID).get()
                .then(snapshotID => {
                    if(snapshotID.empty){
                        console.log("No matching document with userEmail : "+req.query.userEmail+" and userID : "+req.query.userID);
                        console.log("proceeding current request with newUserRegistration.");
                        let docRef = db.collection('users').doc(req.query.userEmail);
                        let setDoc = docRef.set(
                            req.query
                        );
        
                        msg.login = "true";
                        msg.result = 'success';
                        msg.msg = "New User Successfully Registered and Signed in Successfully.";
        
                        console.log(msg);
                        console.log(msg.msg);
        
                        res.write(JSON.stringify(msg));
                        //res.write("user successfully registered.");
                        res.end();
                        return;        
                    }else{
                        msg.login = "false";
                        msg.result = 'failure';
                        msg.msg = "the userID already exists in database but not with the passed userEmail alongwith.";

                        console.log(msg);
                        console.log("something not usual.");
                        console.log(msg.msg);
                        res.write(JSON.stringify(msg));
                        res.end();
                        return;    
                    }
                })
                .catch(err => {
                    console.log('Error getting ID documents : ', err);
                });
            }

            let ss = 0;
            snapshot.forEach(doc =>{
                ss++;
                console.log(doc.id,'=>',doc.data());
                
                if(doc.data().userID === req.query.userID && doc.data().userEmail === req.query.userEmail){
                    msg.login = "true";
                    msg.result = 'success';
                    msg.msg = "Already existing user signedin successfully.";
                    console.log(msg);
                    console.log(msg.msg);
                    res.write(JSON.stringify(msg));
                    res.end();
                    return;
                }else{
                    msg.login = "false";
                    msg.result = 'failure';
                    msg.msg = "the userEmail already exists in database but not with the passed userID alongwith.";
                    console.log(msg);
                    console.log(msg.msg);
                    res.write(JSON.stringify(msg));
                    res.end();
                    return;
                }
                
            });
        })
        .catch(err => {
            console.log('Error getting documents : ', err);
        });
    });

    // Update user details
    app.get('/updateUser', function(req,res){
        msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;
        req.query.userID = "";
        delete req.query.userID;

        let docRef = db.collection("users").doc(req.query.userEmail);
        let updateSingle = docRef.update(req.query);

        console.log(req.query);

        msg.update = req.query;
        msg.result = "success";

        res.write(JSON.stringify(msg));
        res.end();
    });

    // Delete a Particular User
    app.get('/deleteUser', function(req, res){
        msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;

        msg.data = req.query;
        paramList = [{'userEmail':'required'}];

        console.log("deleteUser : following user about to be deleted");
        console.log(req.query);

        // check whether api passed with userEmail
        if(req.query.userEmail == null){
            console.log("req Object has missing userEmail parameter.");
            msg.result = 'failure';
            msg.paramList = paramList;
            msg.msg;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }

        let userRef = db.collection('users').doc(req.query.userEmail).delete();
        msg.result = 'success';
        msg.msg = req.query.userEmail+" successfully deleted.";
        res.write(JSON.stringify(msg));
        res.end();
    });

    // Delete All Users at once
    app.get('/deleteAllUsers', function(req, res){
        msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;

        console.log("warning all user documents are about to be deleted.");
        let userREF = db.collection("users").get()
         .then(snapshot=>{
             if(snapshot.empty){
                msg.msg = "collection users is empty";
                console.log(msg);
                res.write(JSON.stringify(msg));
                res.end();
                return;
             }

             snapshot.forEach(doc=>{
                deleteUser(doc.id);
                console.log(doc.id+" deleted");
             });

             msg.msg = "All Users Successfully Deleted.";
             msg.result = "success";
             res.write(JSON.stringify(msg));
             res.end();
             return;

         })
         .catch(err => {
            msg.msg = 'Error traversing users : ', err;
            console.log(msg);
            res.write(JSON.stringify(msg));
            res.end();
            return;
        });
    });

    // Add a Study Material
    app.get('/addStudyMaterial', function(req, res){
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

        paramList = [
            {'userEmail':'required'},
            {'sem':'required'},
            {'branch':'required'},
            {'type':'required'},
            {'subject':'required'},
            {'materialName':'required'},
            {'topic':'optional'},
            {'resourceType':['drive','url']},
            {'resourceLocation':'required'},
            {'timestamp':'required'},
            {'views':'optional'}
        ];

        extraInfo = [
            {'timestamp':'format(yyyy-mm-dd-HH:MM:SS)'},
            {'sample_request':'http://localhost:5000/addStudyMaterial?passcode=passcode&userEmail=aa1&sem=1&branch=cs&type=notes&subject=ADA&materialName=pdf1.jpg&resourceType=url&resourceLocation=google.com&timestamp=2019-10-21-18-32-00'}
        ];

        console.log("addStudyMaterial : following studyMaterial upload request initiated : ");
        console.log(req.query);

        // check whether api passed important parameters
        for(var i=0; i<paramList.length; i++){
            let k = Object.keys(paramList[i])[0];
            let v = Object.values(paramList[i])[0];

            //console.log("k = "+k+" v = "+v);
            if(v == "optional") continue;
            if(v == "required"){
                var z = checkValidity(k,req.query[k],"false","",msg,paramList);
                if(z.result == "failure"){
                    z.extraInfo = extraInfo;
                    res.end(JSON.stringify(z));
                    return;
                }
            }else{
                var z = checkValidity(k,req.query[k],"true",v,msg,paramList);
                if(z.result == "failure"){
                    z.extraInfo = extraInfo;
                    res.end(JSON.stringify(z));
                    return;
                }
            }
        }

        if(req.query.views == null){
            req.query.views = 0;
        }

        let docRef = db.collection('studymaterial').add(
            req.query
        ).then(ref=>{
            msg.result = "success";
            msg.materialID = ref.id;
            res.end(JSON.stringify(msg));
            return;
        });
        
    });

    // Increment View on Material
    app.get('/incrementStudyMaterialViews', function(req,res){
        msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;

        msg.data = req.query;
        paramList = [{'studyMaterialID':'required'}];

        console.log("incrementStudyMaterialViews : checking and incrementing views for following material");
        console.log(req.query);

        // check whether api passed with userEmail
        if(req.query.studyMaterialID == null){
            console.log("req Object has missing studyMaterialID parameter.");
            msg.result = 'failure';
            msg.paramList = paramList;
            msg.msg;
            res.end(JSON.stringify(msg));
            return;
        }

        let docRef = db.collection('studymaterial').doc(req.query.studyMaterialID);
        let getDoc = docRef.get()
         .then(doc=> {
            if(!doc.exists){
                msg.result = "failure";
                msg.msg = "there doesn't exist any material with studyMaterialID : "+req.query.studyMaterialID;
                res.end(JSON.stringify(msg));
            }else{
                let views = doc.data().views;
                views++;
                let updateDoc = docRef.update({
                    'views' : views
                });

                msg.result = "success";
                msg.studyMaterialID = doc.id;
                msg.updatedMaterial = doc.data();
                msg.updatedMaterial.views = views;
                res.end(JSON.stringify(msg));
                return;
            }
         })
         .catch(err=> {
            msg.result = "failure";
            msg.msg = "some error occured while sending request to firestore : "+err;
            res.end(JSON.stringify(msg));
        });

    });

    // Update Study Material
    app.get('/updateStudyMaterial', function(req,res){
        msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;

        msg.data = req.query;
        paramList = [{'studyMaterialID':'required'}];

        console.log("incrementStudyMaterialViews : checking and incrementing views for following material");
        console.log(req.query);

        // check whether api passed with userEmail
        if(req.query.studyMaterialID == null){
            console.log("req Object has missing studyMaterialID parameter.");
            msg.result = 'failure';
            msg.paramList = paramList;
            msg.msg;
            res.end(JSON.stringify(msg));
            return;
        }

        let newUpdate = req.query;
        let studyMaterialID = req.query.studyMaterialID;
        delete newUpdate.studyMaterialID;
        msg.data.studyMaterialID = studyMaterialID;

        let docRef = db.collection('studymaterial').doc(studyMaterialID);
        let updateStudyMaterial = docRef.update(
            newUpdate
        )
         .then(doc => {
            msg.result = "success";
            msg.studyMaterialID = doc.id;
            let updatedDoc = docRef.get()
             .then(newdoc => {
                console.log("doc.data() "+newdoc.data());
                msg.updatedMaterial = newdoc.data();
                msg.msg = "Study Material Updated Successfully.";
                res.end(JSON.stringify(msg));
                return;
             })
             .catch(err => {
                msg.result = "failure";
                msg.msg = "some error occured while fetching updated Study Material form firestore : "+err;
                res.end(JSON.stringify(msg));
                return;
            });
         })
         .catch(err => {
            msg.result = "failure";
            msg.msg = "some error occured while sending request to firestore : "+err;
            res.end(JSON.stringify(msg));
            return;
        });

    });

    app.get('/searchStudyMaterial', function(req,res){
        msg = {};

        if(!(req.query.key===serviceAccount.littlehelp_key)){
            msg.msg = "Invalid Secret Parameter";
            msg.result = "failure";
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        delete req.query.key;

        msg.data = req.query;
        paramList = [
            {'searchDrive':['true','false']},
            {'searchMaterialWithURL':['true','false']},
            {'sem':'optional'},
            {'branch':'optional'},
            {'type':'optional'},
            {'subject':'optional'},
            {'topic':'optional'},
            {'materialName':'optional'}
        ];

        msg.paramList = paramList;

        console.log("searchStudyMaterial : searching Study Material with following demand");
        console.log(req.query);

        let smRef = db.collection('studymaterial');
        var searchQuery = smRef;

        if(req.query.searchDrive == "true" && req.query.searchMaterialWithURL == "true"){
            
        }else if(req.query.searchDrive == "false" && req.query.searchMaterialWithURL == "true"){
            searchQuery = searchQuery.where("resourceType", '==' , "url");

        }else if(req.query.searchDrive == "true" && req.query.searchMaterialWithURL == "false"){
            searchQuery = searchQuery.where("resourceType", '==' , "drive");

        }

        if(req.query.sem != null){
            searchQuery = searchQuery.where("sem", '==' , req.query.sem);
        }
        if(req.query.branch != null){
            searchQuery = searchQuery.where("branch", '==', req.query.branch);
        }
        if(req.query.type != null){
            searchQuery = searchQuery.where("type", '==' , req.query.type);
        }
        if(req.query.subject != null){
            searchQuery = searchQuery.where("branch", '==', req.query.subject);
        }
        if(req.query.topic != null){
            searchQuery = searchQuery.where("topic", '==' , req.query.topic);
        }
        if(req.query.materialName != null){
            searchQuery = searchQuery.where("materialName", '==', req.query.materialName);
        }

        let searchResult = searchQuery.get()
         .then(snapshot => {
            if(snapshot.empty) {
                msg.result = "success";
                msg.materialCount = 0;
                msg.msg = "No Study Material Found with requested Query.";
                console.log(msg.msg);
                res.end(JSON.stringify(msg));
                return;
            }

            msg.searchResult = [];
            msg.materialCount = 0;
            snapshot.forEach(doc => {
                let m = doc.data();
                m.studyMaterialID = doc.id;
                console.log(doc.id, "==> ", m);
                msg.searchResult.push(m);
                msg.materialCount++;
            });
            msg.result = "success";
            res.end(JSON.stringify(msg));
            return;
         })
         .catch(err => {
            msg.result = "failure";
            msg.msg = "some error occured while performing the search : "+err;
            console.log(msg.msg);
            res.end(JSON.stringify(msg));
            return;
        });

    });
}