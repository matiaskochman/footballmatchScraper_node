const https = require("https");
const cheerio = require('cheerio');

const j18 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5176';
const j1 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5171';
const j2 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5172';

const j19 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5189'

parseHtml = function(){
  var rawData = '';

  var url = j19;

  return new Promise((resolve,reject) => {

      https.get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }

        if (error) {
          console.error(error.message);
          // consume response data to free up memory
          res.resume();
          return;
        }

        res.setEncoding('utf8');

        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const $ = cheerio.load(rawData, {
                normalizeWhitespace: true,
                xmlMode: true
            });
            var resultados = [];
            let children = $('div').attr('xmlns:exsl', 'http://exslt.org/common').children();

            if(children){
              parseResults(children,resultados).then((res) => {
                resolve(res);
              }).catch(function(err){
                console.error('error: '+err);
                reject(err);
              });

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

const parseResults = (children,resultados) => {

  return new Promise((resolve,reject) => {

    var objDate = '';
    children.each(function(index,tag){

      let obj = {};

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
        obj.state = state;


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


        //time
        if(tag.children[0]
          && tag.children[0].children[1]
          && tag.children[0].children[1].attribs.class.includes('match__time')
          && tag.children[0].children[1].children[1]
          && tag.children[0].children[1].children[1].data){


            //var score1 = tag.children[0].children[1].children[1].children[0].data;
            var time = tag.children[0].children[1].children[1].data;
            obj.state.match.matchState = "notStarted";
            obj.state.date = objDate +' '+ time;
        }


        //score1
        if(tag.children[0]
          && tag.children[0].children[1]
          && tag.children[0].children[1].attribs.class.includes('match__scores')
          && tag.children[0].children[1].children[1]
          && tag.children[0].children[1].children[1].children[0]
          && tag.children[0].children[1].children[1].children[0].data){

            var score1 = tag.children[0].children[1].children[1].children[0].data;
            obj.state.match.localResult = score1;
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

        //score2
        if(tag
          &&tag.children[0]
          &&tag.children[0].children[1]
          && tag.children[0].children[1].attribs.class.includes('match__scores')
          &&tag.children[0].children[1].children[3]
          &&tag.children[0].children[1].children[3].children[0]
          &&tag.children[0].children[1].children[3].children[0].data){

          var score2 = tag.children[0].children[1].children[3].children[0].data;
          obj.state.match.visitorResult = score2;

          obj.state.match.matchState = "finished";
        }

        obj.localTeam = team1;
        obj.visitorTeam = team2;

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

module.exports = {parseHtml};
