var parser = require('../utils/parser.js');

var jornadaBase = 171; //codigo necesario para posicionarme en la primera fecha del 2017

const url_ligaA_esp_incomplete = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5'

const  url_ligaA_esp_incomplete_live = "https://www.eurosport.es/_ajax_/live_v8_5/livebox_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&AdPageName=home-event&mime=text%2fxml&DeviceType=desktop&roundid=5";

const  url_ligaB_esp_incomplete = "https://www.eurosport.es/_ajax_/live_v8_5/livebox_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=313&AdPageName=home-event&mime=text%2fxml&DeviceType=desktop&roundid=5"

const ligab = "https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=313&mime=text%2fxml&DeviceType=desktop&roundid=5"


parseLeague = (req,resp) => {
  //para parsear toda las fechas sin los resultados
  //simulando que no se jugo ningun partido
  //para hacer las pruebas de los forecasts
  let noresults = false;

  if(req.query.noresults){
    noresults = req.query.noresults;
  }

  var fullObj = {};
  var results = [];

  var promises = [];

  var urls = [];
  var urls_live = [];

  //iterando cada jornada para crear una query por la jornada
  for(jornada=0;jornada<38;jornada++){
    var requestObj = {};
    var jordanaCompuesta = jornadaBase+jornada
    var url_live = url_ligaA_esp_incomplete_live.concat(jordanaCompuesta);
    var url = url_ligaA_esp_incomplete.concat(jordanaCompuesta);
    //var url = ligab.concat(jordanaCompuesta);

    urls[jornada] = url;
    //urls_live[jornada] = url_live;
    urls_live.push(url_live);

    //let index_jornada = jornada +1;
    let index_jornada = jornada;
    //console.log('jornada_index: ',index_jornada)
    promises[jornada] = new Promise(function(resolve,reject){
      //parsear el html y convertirlo en json

      var obj = {url:url_live,live:true,index_jornada,noresults};

      parser.parseHtml(obj).then(function(res){
        resolve(res);
      }).catch(function(err){
        reject(err);
      });
    });
  }


  Promise.all(promises).then(values => {
    let base = 'J';
    let jornadas = [];
    let count = 1;

    values.map(function(val,index){
      jornada = {};
      if(val && val.length > 0){
        let jornada_index = base.concat(count);
        jornada.title = jornada_index;
        jornada.list= val;
        jornadas[index] = jornada;
        count++;
      }
    });
    resp.status(200).send({jornadas,urls,urls_live});
  }).catch(function(err){
    console.log(err)
  });
}

module.exports = {parseLeague};
