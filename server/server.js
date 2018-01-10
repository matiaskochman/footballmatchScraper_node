
const _ = require('lodash');
const express = require('express');
const https = require("https");
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
var parser = require('./parser.js');
const port = process.env.PORT || 3000;


var jornadaBase = 170;
var url_incomplete = 'https://www.eurosport.es/_ajax_/results_v8_5/results_teamsports_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&seasonid=96&mime=text%2fxml&DeviceType=desktop&roundid=5'


var app = express();
app.use(bodyParser.json());
var rawData = '';
var json = [];
var requestsArray = [];

app.get('/data',(req,resp) => {

  var fullObj = {};
  var results = [];

  var promises = [];
  var urls = [];

  for(jornada=0;jornada<38;jornada++){
    var requestObj = {};
    var jordanaCompuesta = jornadaBase+jornada
    var url = url_incomplete.concat(jordanaCompuesta);

    urls[jornada] = url;
    promises[jornada] = new Promise(function(resolve,reject){
      parser.parseHtml(url).then(function(res){
        resolve(res);
      }).catch(function(err){
        reject(err);
      });
    })

    //requestsArray.push(requestObj);
  }

  console.log(promises);

  Promise.all(promises).then(values => {
    let base = 'j';
    let jornadas = {};
    let count = 1;
    values.map(function(val,index){

      if(val && val.length > 0){
        let jornada_index = base.concat(count);
        jornada[jornada_index] = val;
        count++;

      }

      //console.log(jornada);

      //results.push(jornada);

      //console.log(results);
    });

    //console.log(results);
    resp.status(200).send({jornadas,urls});

  }).catch(function(err){
    console.log(err)
  });


  //console.log(resultados);
  //fullObj.jornadas = results;
/*
  parser.parseHtml(i).then((json)=>{
    results.push(json);
  }).catch((error) => {
    console.error(error);
  });
*/
});


app.listen(port,()=>{
  console.log(`server listening in port ${port}`);
})

module.exports ={app};
