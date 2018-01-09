
const _ = require('lodash');
const express = require('express');
const https = require("https");
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
var parser = require('./parser.js');
const port = process.env.PORT || 3000;


var app = express();
app.use(bodyParser.json());
var rawData = '';
var json = [];


app.get('/data',(req,resp) => {

  parser.parseHtml().then((json)=>{

      resp.status(200).send({fecha: json});
  }).catch((error) => {
	console.error(error);
});

});


app.listen(port,()=>{
  console.log(`server listening in port ${port}`);
})

module.exports ={app};
