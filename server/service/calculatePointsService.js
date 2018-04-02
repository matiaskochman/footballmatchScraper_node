var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("../firebase/firebase_config.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://laporra-4a9d4.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();

var matchMap = {};

calculatePoints = (req,resp) => {

  //var ref = db.ref("restricted_access/secret_document");
  var jornadasRef = db.ref('/jornadas');
  jornadasRef.once("value", function(snapshot) {
    const jornadas = snapshot.val();

    for(let i_1=0; jornadas.length > i_1 ; i_1++){
      console.log(i_1)
      let dias_fecha = jornadas[i_1].list;
      for(let i_2=0;dias_fecha.length > i_2; i_2++){
        console.log('__',i_2);
      }
    }

    resp.status(200).send({jornadas});    //console.log(snapshot.val());
  });

}

module.exports = {
  calculatePoints
}
