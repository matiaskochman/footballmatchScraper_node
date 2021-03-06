const https = require("https");
const cheerio = require('cheerio');

const j18 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5176';
const j1 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5171';
const j2 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5172';

const j19 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5189'

parseHtml = function({url,live,index_jornada,noresults}){
  /*
  var jornadaBase = 70;
  var jordanaCompuesta = jornadaBase+day
  var url_incomplete = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=51'
  var url = url_incomplete.concat(jordanaCompuesta);
*/
  var rawData = '';
  return new Promise((resolve,reject) => {

      https.get(url, (res) => {

        //handle result
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }

        if (error) {
          //handle error
          console.error(error.message);
          // consume response data to free up memory
          res.resume();
          return;
        }
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          //downloading data
          rawData += chunk;
        });
        res.on('end', () => {
          // finished downloading
          try {
            const $ = cheerio.load(rawData, {
                normalizeWhitespace: true,
                xmlMode: true
            });
            var resultados = [];

            if(!live){
              var children = $('div').attr('xmlns:exsl', 'http://exslt.org/common').children();

            }else{
              //var node = $('div').attr('class', 'ajax-data');
              var children = $('div').children().first().children();

            }

            if(children){

              if(!live){
                parseResults(children,resultados).then((res) => {
                  resolve(res);
                }).catch(function(err){
                  console.error('error: '+err);
                  reject(err);
                });
              }else{
                //aca parsea live results_v8_5

                parseResults_live(children,index_jornada,noresults).then((res) => {
                  resolve(res);
                }).catch(function(err){
                  console.error('error: '+err);
                  reject(err);
                });

              }
            }
          } catch (e) {
            console.error(e.message);
          }

        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });
  });
}

const parseResults_live = (children,jornada,noresults) =>{
  return new Promise((resolve,reject) => {
    var objDate = '';
    fecha = [];
    children.each(function(index,tag){
      parseFechaDia(tag,index,jornada,noresults)

    });

    if(fecha){
      resolve(fecha);
    }else{
      reject(fecha)
    }
  });

}


const calculatePoints = (obj) => {
  return new Promise((resolve,reject) => {
    if(obj
      && obj.visitorResult
      && obj.localResult){


    }
  })
}

const parsePartido = (partido_tag,fecha_partido,jornada,index_fecha_dia,index_partido,noresults) => {

  if(partido_tag.children[0]
    && partido_tag.children[0].children[0]
    && partido_tag.children[0].children[0].children[1]
    && partido_tag.children[0].children[0].children[1].attribs
    && partido_tag.children[0].children[0].children[1].attribs.class
    && partido_tag.children[0].children[0].children[1].attribs.class.includes('team__name')
    && partido_tag.children[0].children[2]
    && partido_tag.children[0].children[2].children[1]
    && partido_tag.children[0].children[2].children[1].attribs
    && partido_tag.children[0].children[2].children[1].attribs.class
    && partido_tag.children[0].children[2].children[1].attribs.class.includes('team__name')){


      let localTeam = partido_tag.children[0].children[0].children[1].children[0].data;
      let visitorTeam = partido_tag.children[0].children[2].children[1].children[0].data;

      if(!partido_tag.children[0].children[1].children[1].children){
        var localResult = 'x';
        var visitorResult = 'x';
        var matchState = 'notStarted'
        var match_time = partido_tag.children[0].children[1].children[1].data;
      }else{

        if(noresults){
          //para crear casos de prueba donde ninguna fecha del torneo tiene
          //partidos con resultados
          var localResult = 'x';
          var visitorResult = 'x';
          var matchState = 'notStarted'
          var match_time = '00:01';
        }else{
          //el caso normal
          var matchState = 'finished'
          var localResult = partido_tag.children[0].children[1].children[1].children[0].data;
          var visitorResult = partido_tag.children[0].children[1].children[3].children[0].data;
        }

      }

      index_fecha_dia--;
      let index_fecha_partido = jornada.toString().concat('_').concat(index_fecha_dia.toString()).concat('_').concat(index_partido);
      //let key = index_fecha_partido;
      let partido = {localTeam,visitorTeam,localResult,visitorResult,match_time,matchState,index_fecha_partido}
      index_fecha_dia++;
      fecha_partido.partidos.push(partido);
  }
}

const parseFechaDia = (tag,index_fecha_dia,jornada,noresults) =>{

  if(tag
    && tag.attribs
    && tag.attribs.class
    && tag.attribs.class.includes('date-wrapper')){

      var obj = {};
      var partidos = [];
      obj.partidos = [];
      obj.key = index_fecha_dia;
      var match_date_list = [];
      var match_date_anterior = '';
      let count_partidos = 0;

      if(tag.children[0]
        && tag.children[0].attribs
        && tag.children[0].attribs.class
        && tag.children[0].attribs.class.includes('date-caption')){

          //var t1 = tag.children[0].children[0].children[1].children[0].data;
          let match_date = tag.children[0].children[0].data;
          //console.log(match_date)
          if(match_date !== match_date_anterior){
            obj.match_date = match_date
            match_date_anterior = match_date;
          }

          var fecha_partido = {}
          fecha_partido.fecha = match_date;
          fecha_partido.partidos = [];
          var partidos =  tag.children[1].children;

          partidos.map(function(partido_tag,index){
            parsePartido(partido_tag,fecha_partido,jornada,index_fecha_dia,index,noresults);
          });

          fecha.push(fecha_partido);
          //console.log(fecha_partido);
      }

  }

}

module.exports = {parseHtml};
