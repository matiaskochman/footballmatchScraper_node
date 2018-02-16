const https = require("https");
const cheerio = require('cheerio');

const j18 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5176';
const j1 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5171';
const j2 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5172';

const j19 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5189'

parseHtml = function({url,live}){
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

                parseResults_live(children,resultados).then((res) => {
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

const parseResults_live = (children,resultados) =>{
  return new Promise((resolve,reject) => {

    var objDate = '';

    fecha = [];

    children.each(function(index,tag){


      if(tag
        && tag.attribs
        && tag.attribs.class
        && tag.attribs.class.includes('date-wrapper')){


          var obj = {};
          var partidos = [];
          obj.partidos = [];
          obj.key = index;
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


                    let team1 = partido_tag.children[0].children[0].children[1].children[0].data;
                    let team2 = partido_tag.children[0].children[2].children[1].children[0].data;
                    if(!partido_tag.children[0].children[1].children[1].children){

                      var score1 = 'x';
                      var score2 = 'x';
                      var match_state = 'notStarted'
                      var match_time = partido_tag.children[0].children[1].children[1].data;
                    }else{
                      var match_state = 'finished'
                      var score1 = partido_tag.children[0].children[1].children[1].children[0].data;
                      var score2 = partido_tag.children[0].children[1].children[3].children[0].data;
                    }

                    let partido = {team1,team2,score1,score2,match_time,match_state}
                    fecha_partido.partidos.push(partido);
                    //console.log(partido)
                }


              });
              fecha.push(fecha_partido);
              //console.log(fecha_partido);
          }

      }


/*
      if(tag && tag.attribs && tag.attribs.class && tag.attribs.class.includes('date-wrapper')){
        tag.children.map(function(d01,i01){
          if(d01){
            obj.date = d01.data;
            objDate = d01.data;
            resultados.push(obj);
          }
        });

      }
*/

    });

    console.log(fecha);
    resultados.push(fecha);
    if(resultados){
      resolve(resultados);
    }else{
      reject(resultados);
    }
  });

}


/**************************************/


const parseResults = (children,resultados) => {
  return new Promise((resolve,reject) => {
    var objDate = '';
    children.each(function(index,tag){

      let obj = {};
      obj.key = index;

      if(tag && tag.attribs && tag.attribs.class && tag.attribs.class.includes('date-caption')){
        tag.children.map(function(d01,i01){
          if(d01){
            obj.date = d01.data;
            objDate = d01.data;
            resultados.push(obj);
          }
        })
      } else if(tag && tag.attribs && tag.attribs.class && tag.attribs.class === 'match'){

        let state = {};
        let match = {};
        state.match = match;

        //team1
        if(tag.children[0]
          && tag.children[0].children[0]
          && tag.children[0].children[0].children[1]
          && tag.children[0].children[0].children[1].attribs
          && tag.children[0].children[0].children[1].attribs.class
          && tag.children[0].children[0].children[1].attribs.class.includes('team__name')){

            //var t1 = tag.children[0].children[0].children[1].children[0].data;
            var team1 = tag.children[0].children[0].children[1].children[0].children[0].data;
        }
          //team2
        if(tag
            &&tag.children[0]
            && tag.children[0].children[2]
            && tag.children[0].children[2].children[1]
            && tag.children[0].children[2].children[1].children[0]
            && tag.children[0].children[2].children[1].children[0].children[0]
            && tag.children[0].children[2].children[1].children[0].children[0].data
            && tag.children[0].children[2].children[1].attribs.class.includes('team__name')){

              var team2 = tag.children[0].children[2].children[1].children[0].children[0].data;
              //var t2 = tag.children[0].children[2].children[1].children[0].data;
        }
        obj.localTeam = team1;
        obj.visitorTeam = team2;
        //obj.state = state;

        //time
        if(tag.children[0]
          && tag.children[0].children[1]
          && tag.children[0].children[1].attribs.class.includes('match__time')
          && tag.children[0].children[1].children[1]
          && tag.children[0].children[1].children[1].data){

            //var score1 = tag.children[0].children[1].children[1].children[0].data;
            var time = tag.children[0].children[1].children[1].data;
            //obj.state.match.matchState = "notStarted";
            //obj.state.date = objDate +' '+ time;
            obj.matchState = "notStarted";
            obj.date = objDate +' '+ time;

        }

        //score1
        if(tag.children[0]
          && tag.children[0].children[1]
          && tag.children[0].children[1].attribs.class.includes('match__scores')
          && tag.children[0].children[1].children[1]
          && tag.children[0].children[1].children[1].children[0]
          && tag.children[0].children[1].children[1].children[0].data){

            var score1 = tag.children[0].children[1].children[1].children[0].data;
            //obj.state.match.localResult = score1;
            obj.localResult = score1;
        }

        //score2
        if(tag
          &&tag.children[0]
          &&tag.children[0].children[1]
          && tag.children[0].children[1].attribs.class.includes('match__scores')
          &&tag.children[0].children[1].children[3]
          &&tag.children[0].children[1].children[3].children[0]
          &&tag.children[0].children[1].children[3].children[0].data){

          var score2 = tag.children[0].children[1].children[3].children[0].data;
          //obj.state.match.visitorResult = score2;
          //obj.state.match.matchState = "finished";

          obj.visitorResult = score2;
          obj.matchState = "finished";
        }
/*
        calculatePoints(obj).then(function(points){
          obj.points = points;
        })
*/
        resultados.push(obj);
      }
    })

    if(resultados){
      resolve(resultados);
    }else{
      reject(resultados);
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
module.exports = {parseHtml};
