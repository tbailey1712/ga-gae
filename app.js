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



//app.use('/books', require('./books/crud'));
//app.use('/api/books', require('./books/api'));

app.get('/', (req, res) => 
{

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

  //res.status(200).send('Hello, world!');
});

app.get('/api/refresh', (req, res) =>
{
  var message = 'Hello McDuck! <br>'
  var project_id = "api-project-73897325473";

  var moment = require('moment-timezone');
  moment.tz.setDefault("America/Chicago");
  var now = moment().format("MM/DD/YYYY HH:mm");

  var yest = getYesterday();
  var day30 = get30DayBottom();

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

  var getValuePromise = getValue("Yesterday.Pageviews");

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

  var getValuePromise = getValue("Last30Days.Pageviews");

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

  var getValuePromise = getValue("Last30Days.BottomPages");

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



let getReports = function (reports) 
{
  console.log("getReports(): Beginning Auth/Get");

  var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
  var analytics = google.analyticsreporting('v4');

  const service_account = require('./npm-service-key.json'); 
  //var key = "-----BEGIN PRIVATE KEY-----n+ZG7UI/HR+spW\n-----END PRIVATE KEY-----\n"; 
  //var jwtClient = new google.auth.JWT(process.env.client_email, null, key, scopes, null);
  var jwtClient = new google.auth.JWT(service_account.client_email, null, service_account.private_key, scopes, null);
  
  jwtClient.authorize();
  console.log("getReports(): Authorized");

  let request = {
      'auth': jwtClient, 
      'resource': reports
  };

  return analytics.reports.batchGet(request);

};

function getYesterday()
{
  console.log("getYesterday(): Sending GA Request");
  writeTimestamp();


  var viewID = "65651086";
  let basic_report = {
    'reportRequests': [
        {
            'viewId': viewID,
            'dateRanges': [{'startDate': 'yesterday', 'endDate': 'yesterday'}],
            'metrics': [{'expression': 'ga:pageviews'}]
        }

    ]
  };

  var pv = -1;
  
  getReports(basic_report)
    .then(response => { 

      //console.log("getYesterday(): GA returned: " + JSON.stringify(response.data, null, 4) );
      
      var data = response.data.reports[0].data;
      for(var property in data) {
          console.log("getYesterday(): " + property + "=" + data[property]);
      } 
      //console.log("getYesterday(): Full Data=" + JSON.stringify(data, null, 4) );
      pv = data.totals[0]["values"];  

      console.log("getYesterday() Value Returning: " + pv);
      storeValue("Yesterday.Pageviews", pv.toString() );

      return response;
    })
    .catch(e => { 
      console.log("getYesterday() GA Returned an error: " + e);
      return e;
    });
  
  
}

function get30DayBottom()
{
  console.log("get30DayBottom(): Sending GA Request");

  var viewID = "65651086";
  let basic_report = {
    'reportRequests': [
          {
            'viewId': viewID,
            'dateRanges': [{'startDate': '30daysago', 'endDate': 'today'}],
            'metrics': [{'expression': 'ga:pageviews'}]
        },
        {
            'viewId': viewID,
            'dateRanges': [{'startDate': '30daysago', 'endDate': 'today'}],
            'metrics': [{'expression': 'ga:pageviews'}],
            'dimensions' : [{'name' : 'ga:pageTitle'}],
            'orderBys':
                [
                    {'fieldName': 'ga:pageviews', 'sortOrder': 'ASCENDING'}
                ]

        }

    ]
  };

  var pv = -1;
  
  getReports(basic_report)
    .then(response => { 

//      console.log("get30DayBottom(): GA returned: " + JSON.stringify(response.data, null, 4) );
      console.log("get30DayBottom(): GA returned data" );
      
      var data = response.data.reports[0].data;
      
      /*
      for(var property in data) {
          console.log("get30DayBottom(): " + property + "=" + data[property]);
      } 
      */
      
      pv = data.totals[0]["values"];  

      //console.log("get30DayBottom() Value Returning: " + pv);
      storeValue("Last30Days.Pageviews", pv.toString() );

      //console.log("get30DayBottom(): Report1 Data=" + JSON.stringify( response.data.reports[1], null, 4) );
      var pagerows = response.data.reports[1].data.rows;
      buildJSON(pagerows, pv);
	  
      /*
      for(var index in pagerows) {
          console.log("get30DayBottom(): Dimensions=" + pagerows[index]["dimensions"]);
          console.log("get30DayBottom(): Pageviews=" + pagerows[index]["metrics"][0]["values"]);
      } 
      */
      return response;
    })
    .catch(e => { 
      console.log("get30DayBottom() GA Returned an error: " + e);
      console.log("get30DayBottom() Try/Catch Stack " + e.stack );
      return e;
    });


}

function buildJSON(pagerows, totalpv)
{
	var o = {} // empty Object
  var maxpv = totalpv * .10;

	var key = 'RowReport';
	o[key] = []; // empty Array, which you can push() values into

	for(var index in pagerows) {
         // console.log("buildJSON(): Dimensions=" + pagerows[index]["dimensions"]);
         // console.log("buildJSON(): Pageviews=" + pagerows[index]["metrics"][0]["values"]);

          var rowpv = pagerows[index]["metrics"][0]["values"];

          var row = {
          	pageTitle: pagerows[index]["dimensions"],
          	pageviews: rowpv
          } 
          if (rowpv <= maxpv) {
            o[key].push(row);  
          }
    } 
    console.log( JSON.stringify(o) );
    storeValue("Last30Days.BottomPages", JSON.stringify(o) );
}

function writeTimestamp()
{
	try {

    //var moment = require('moment');
    var moment = require('moment-timezone');

    moment.tz.setDefault("America/Chicago");
    var now = moment().format("MM/DD/YYYY HH:mm");
    console.log("writeTimestamp() Moment returns " + now);
    storeValue("LastUpdated", now);

	}
	catch (ex)
	{
		console.error("writeTimestamp() Error: " + ex.stack);
	}

}



/*
    Split into a separate module
 */
async function storeValue(key, value)
{
  // KIND, KEY, VALUE

  console.log("storeValue key=" + key + " value=" + value);

  const Datastore = require('@google-cloud/datastore');
  const projectId = 'api-project-73897325473';

  const datastore = Datastore({ projectId: projectId });

  const kind = 'GA';
  const gcskey = datastore.key([kind, key]);

  const entry = {
    key: gcskey,
    data: {
      "value" : value,
      excludeFromIndexes: true
    },
    excludeFromIndexes: ['value']
  };


  datastore.save(entry)
    .then(() => console.log("storeValue Succeded: key=" + key + " value=" + value ))
    .catch((err) => {
      console.error(err);
    });  

}


/*
    Split into a separate module
 */
function getValue(row)
{
  console.log("getValue(" + row + ") Beginning ");

  const Datastore = require('@google-cloud/datastore');
  const projectId = 'api-project-73897325473';

  const datastore = Datastore({ projectId: projectId });

  const kind = 'GA';
  const key = datastore.key([kind, row]);

  return new Promise(function(resolve, reject) {
      // Do async job
    datastore.get(key, function(err, entity) {
      if (err != null) 
      {
        console.log("getValue(" + row + ") err=" + err);
        reject(err);
      }
      else
      {
        console.log("getValue(" + row + ") entity=" + JSON.stringify(entity) + " value=" + entity.value);
        resolve(entity.value);
      }
    });

  });

  
  
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
