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

module.exports = function(app){

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
            msg.param = paramList;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }
        if(req.query.userEmail == null){
            console.log("req Object has missing userEmail parameter.");
            msg.result = 'failure';
            msg.login = "false";
            msg.param = paramList;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }

        // check whether user already exists
        let usersRef = db.collection('users');
        let query = usersRef.where('userEmail','==',req.query.userEmail).get()
        .then(snapshot => {
            if(snapshot.empty){

                let usersIDRef = db.collection('ussers');
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

        console.log("deleteUse : following user about to be deleted");
        console.log(req.query);

        // check whether api passed with userEmail
        if(req.query.userEmail == null){
            console.log("req Object has missing userEmail parameter.");
            msg.result = 'failure';
            msg.param = paramList;
            msg.msg;
            res.write(JSON.stringify(msg));
            res.end();
            return;
        }

        msg.msg = "No user with userEmail "+req.query.userEmail+" exists.";

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

    //other routes..
}