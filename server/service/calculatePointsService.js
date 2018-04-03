//var admin = require("firebase-admin");
const _ = require('lodash');

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


  var usuarios_modificados = [];
  var usuarios;
  await usuariosRef.once('value').then(function (snapshot) {
    usuarios = snapshot.val();
    //console.log(usuarios)

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

                  let obj = {name:usuario.facebookData.name,index:index_fecha_partido,points:'notCalculated'}

                  let points = calculatePointsOfMatch(jornadas[i].list[j].partidos[z],usuario.Apuestas[index_fecha_partido])

                  obj.points = points;

                  usuarios_modificados.push(obj);
                }
            });
            /*
  					let forecast = forecasts[index_fecha_partido];
  					if(_.isNull(forecast) || _.isUndefined(forecast)){
  						continue;
  					}
  					jornadas[i].list[j].partidos[z].localForecast = forecast.localForecast;
  					jornadas[i].list[j].partidos[z].visitorForecast = forecast.visitorForecast;
  					if(typeof forecast.matchState === 'undefined'){
  						throw new Error('forecast.matchState undefined')
  					}
            */
            //console.log(index_fecha_partido);
  					//jornadas[i].list[j].partidos[z].matchState = forecast.matchState ;

  					/*
  					let points = calculatePoints(forecast,matchResults[i].list[j].partidos[z]);
  					matchResults[i].list[j].partidos[z].points = points;
  					*/
  				}
  			}
  		}
  	}
  }).catch(function(error){
    console.error(error)
  });

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
