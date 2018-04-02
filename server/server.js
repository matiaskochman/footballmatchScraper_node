
const _ = require('lodash');
const express = require('express');
const https = require("https");
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
//var parser = require('./parser.js');
var parseService = require('./service/parseService');
const pointsService = require('./service/calculatePointsService');
const port = process.env.PORT || 3000;

//https://www.eurosport.es/_ajax_/live_v8_5/livebox_v8_5.zone?O2=1&site=ese&langueid=6&dropletid=150&domainid=141&sportid=22&revid=309&AdPageName=home-event&mime=text%2fxml&DeviceType=desktop&roundid=5187


var app = express();
app.use(bodyParser.json());
var rawData = '';
var json = [];
var requestsArray = [];

app.get('/data',(req,resp) => {

  parseService.parseLeague(req,resp);

});

app.get('/calculatePoints',(req,resp) =>{
  pointsService.calculatePoints(req,resp);
});

app.listen(port,()=>{
  console.log(`server listening in port ${port}`);
})

module.exports ={app};
