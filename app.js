// Copyright 2018, Google LLC.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';


const express = require('express');
const {google} = require('googleapis');
const ErrorReporting = require('@google-cloud/error-reporting').ErrorReporting;

const app = express();

const errorlog = new ErrorReporting();
require('@google-cloud/debug-agent').start();
require('@google-cloud/profiler').start();

var dataHelper = require('./data.js');
var reports = require('./reports.js');



//app.use('/books', require('./books/crud'));
//app.use('/api/books', require('./books/api'));

app.get('/', (req, res) => 
{

/*
  switch (req.method) {
    case 'GET':
      console.log("GAE default: Incoming GET Request");
      handleGET(req, res);
      break;
    case 'PUT':
      console.log("GAE default: Incoming PUT Request");
      handlePUT(req, res);
      break;
    default:
      res.status(500).send({ error: 'Invalid Request' });
      break;
  }
*/
  res.status(200).send('McDuck Labs API Service Status: Running');
});

app.get('/api/refresh', (req, res) =>
{
  var message = 'Hello McDuck! <br>'
  var project_id = "api-project-73897325473";

  var moment = require('moment-timezone');
  moment.tz.setDefault("America/Chicago");
  var now = moment().format("MM/DD/YYYY HH:mm");

  var yest = reports.getYesterday();
  var day30 = reports.get30DayBottom();

  message = message + 'Last Updated = ' + now + '<br>';

  res.status(200).send(message); 
});

app.get('/api/yesterday/pageviews', (req, res) =>
{
  //var pageviews = getValue("Yesterday.Pageviews");
  //console.log("/api/yesterday/pageviews: received " + JSON.stringify(pageviews));
  //console.log("/api/yesterday/pageviews: value= " + pageviews );

  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST')

  let pageviews = "0";

  var getValuePromise = dataHelper.getValue("Yesterday.Pageviews");

  getValuePromise.then( function(result){ 
    console.log("/api/yesterday/pageviews: getValue returned value= " + result );
    res.status(200).send( result );
  }, function (error) {
    console.log("/api/yesterday/pageviews: getValue sent an Error: " + error);
    res.status(500).send("Error Retrieving");  
  }); 
  console.log("/api/yesterday/pageviews: finished ");  
});


app.get('/api/last30days/pageviews', (req, res) =>
{
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST')

  var getValuePromise = dataHelper.getValue("Last30Days.Pageviews");

  getValuePromise.then( function(result){ 
    console.log("/api/last30days/pageviews: getValue returned value= " + result );
    res.status(200).send( result );
  }, function (error) {
    console.log("/api/last30days/pageviews: getValue sent an Error: " + error);
    res.status(500).send("Error Retrieving");  
  }); 
  console.log("/api/last30days/pageviews: finished ");  
});

app.get('/api/last30days/bottompages', (req, res) =>
{
  res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST')

  var getValuePromise = dataHelper.getValue("Last30Days.BottomPages");

  getValuePromise.then( function(result){ 
    console.log("/api/last30days/bottompages: getValue returned value= " + result );
    res.status(200).send( result );
  }, function (error) {
    console.log("/api/last30days/bottompages: getValue sent an Error: " + error);
    res.status(500).send("Error Retrieving");  
  }); 
  console.log("/api/last30days/bottompages: finished ");  
});



app.get('/report', (req, res) =>
{
   res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST')
   
  res.status(200).send('your report'); 
});


function handleGET (req, res) {
  // Do something with the GET request
  var q = req.query.q;
  message = message + 'Query Type q=' + q + '<br>';

  switch (q) {
    case 'GA':
      console.log("handleGET: Query is GA");
      var yest = getYesterday();
      var day30 = get30DayBottom();
      message = message + 'GA query submitted';
      res.status(200).send(message);
      break;
    case 'report':
      console.log("handleGET: Publishing message to topic REFRESH_GA_DATA_TOPIC");
      var path = require('path');
      res.sendFile(path.join(__dirname + '/report.html'));
      break;
    default:
      console.log("handleGET: No Query Specified");
      res.status(200).send(message);
      break;
  }

  //getData();

  
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}




/*
*
*	APP STARTUP CODE
*
*/


if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
