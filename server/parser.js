const https = require("https");
const cheerio = require('cheerio');

const j18 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5176';
const j1 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5171';
const j2 = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5172';

const j19 = 'https://www.eurosport.es/_ajax_/live_v8_5/livebox_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&AdPageName=home-event&mime=text%2fxml&DeviceType=desktop&roundid=5189';

parseHtml = function(){
  var rawData = '';

  return new Promise((resolve,reject) => {

      https.get(j1, (res) => {
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

    children.each(function(index,tag){

      let obj = {};

      if(tag && tag.attribs && tag.attribs.class && tag.attribs.class.includes('date-caption')){
        tag.children.map(function(d01,i01){
          if(d01){
            obj.date = d01.data;
            resultados.push(obj);
          }
        })
      } else if(tag && tag.attribs && tag.attribs.class && tag.attribs.class === 'match'){

        let state = {};
        let match = {};
        state.match = match;
        obj.state = state;
        
        if(tag.children[0] && tag.children[0].children[0] && tag.children[0].children[0].children[1] &&
          tag.children[0].children[0].children[1].children[0].children[0]
          && tag.children[0].children[0].children[1].attribs.class.includes('team__name')){

            var team1 = tag.children[0].children[0].children[1].children[0].children[0].data;
          }
        if(tag.children[0] && tag.children[0].children[1] && tag.children[0].children[1].children[1]
          && tag.children[0].children[1].children[1].children[0]
          && tag.children[0].children[1].children[1].children[0].data){

            var score1 = tag.children[0].children[1].children[1].children[0].data;
          }

        if(tag
          &&tag.children[0]
          && tag.children[0].children[2]
          && tag.children[0].children[2].children[1]
          && tag.children[0].children[2].children[1].children[0]
          && tag.children[0].children[2].children[1].children[0].children[0]
          && tag.children[0].children[2].children[1].children[0].children[0].data
          && tag.children[0].children[2].children[1].attribs.class.includes('team__name')){

            var team2 = tag.children[0].children[2].children[1].children[0].children[0].data;
        }

        if(tag
          &&tag.children[0]
          &&tag.children[0].children[1]
          &&tag.children[0].children[1].children[3]
          &&tag.children[0].children[1].children[3].children[0]
          &&tag.children[0].children[1].children[3].children[0].data){

          var score2 = tag.children[0].children[1].children[3].children[0].data;

        }

        obj.localTeam = team1;
        obj.visitorTeam = team2;
        obj.state.match.matchState = "finished";
        obj.state.match.localResult = score1;
        obj.state.match.visitorResult = score2;

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
