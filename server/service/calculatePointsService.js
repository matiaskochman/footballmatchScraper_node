//var admin = require("firebase-admin");
const _ = require('lodash');
const moment = require('moment');
// Fetch the service account key JSON file contents
var serviceAccount = require("../firebase/firebase_config.json");

// Initialize the app with a service account, granting admin privileges
/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://laporra-4a9d4.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
*/
var matchMap = {};

calculateTotalPoints = async (req,resp,db) => {
  var usuariosRef = db.ref('/users');
  var usuarios_modificados = {};
  var usuarios;
  await usuariosRef.once('value').then(function (snapshot) {
    usuarios = snapshot.val();
  }).catch(function(err){
    console.log(err)
  })


  var jornadas;
  var jornadasRef = db.ref('/jornadas');

  await jornadasRef.once("value").then(function(snapshot) {

    jornadas = snapshot.val();

    if(jornadas){

      if(_.isNull(usuarios) || _.isUndefined(usuarios)){
        throw new Error('no hay usuarios en Firebase');
      }
      let usuariosArray = Object.values(usuarios);

  		for(var i=0;i<jornadas.length;i++){
  			for(let j=0; j<jornadas[i].list.length; j++){
  				for(let z=0;z<jornadas[i].list[j].partidos.length;z++){
  					let index_fecha_partido = jornadas[i].list[j].partidos[z].index_fecha_partido;


            usuariosArray.forEach(function(usuario) {

                if(usuario.Apuestas[index_fecha_partido]){

                  //let obj = {name:usuario.facebookData.name,index:index_fecha_partido,points:'notCalculated'}

                  let points = calculatePointsOfMatch(jornadas[i].list[j].partidos[z],usuario.Apuestas[index_fecha_partido]);

                  let apuesta = {...usuario.Apuestas[index_fecha_partido]};
                  apuesta.points = points;
                  apuesta.date_modified = moment().format();
                  //obj.points = points;
                  //obj.facebookId = usuario.facebookData.id;
                  let route = `/users/${usuario.facebookData.id}/Apuestas/${index_fecha_partido}`
                  usuarios_modificados[route] = apuesta;

                }
            });

  				}
  			}
  		}
  	}
  }).catch(function(error){
    console.error(error)
  });

  await db.ref().update(usuarios_modificados).then(function(){
    console.log('update users with points')
  }).catch(function(err){
    console.error(err);
  })

  resp.status(200).send({usuarios_modificados});    //console.log(snapshot.val());

}

calculatePointsOfMatch = (fechaJugada,apuesta) =>{

  console.log(fechaJugada);
  console.log(apuesta);
  if(fechaJugada['matchState'] === 'finished'){

    if(fechaJugada.localResult === apuesta.localForecast){

      if(fechaJugada.visitorResult === apuesta.visitorForecast){

        //acerto el resultado exacto , 5ptos
        return 5;
      }
    }
    if(fechaJugada.localResult < fechaJugada.visitorResult){
        if(apuesta.localForecast < apuesta.visitorForecast){
          // ganó visitante y el forecast acertó
          return 3;
        }else{
          // ganó visitante y forecast no acertó
          return 0;
        }
    }else if(fechaJugada.localResult > fechaJugada.visitorResult){
      if(apuesta.localForecast > apuesta.visitorForecast){
        // ganó visitante y el forecast acertó
        return 3;
      }else{
        // ganó visitante y forecast no acertó
        return 0;
      }

    }else if(fechaJugada.localResult === fechaJugada.visitorResult){
      if(apuesta.localForecast === apuesta.visitorForecast){
        // ganó visitante y el forecast acertó
        return 3;
      }else{
        // ganó visitante y forecast no acertó
        return 0;
      }

    }


  }

  return 0;

}

module.exports = {
  calculateTotalPoints
}
