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
var moment = require('moment');

const app = express();

const errorlog = new ErrorReporting();


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


function handleGET (req, res) {
  // Do something with the GET request
  var message = 'Hello McDuck! <br>'
  var project_id = "api-project-73897325473";

  message = message + 'URL: ' + req.baseUrl + '<br>';
  message = message + 'Project ID = ' + project_id + '<br>';

  var q = req.query.q;
  message = message + 'Query Type q=' + q + '<br>';

  writeTimestamp();

  switch (q) {
    case 'GA':
      console.log("handleGET: Query is GA");
      var yest = getYesterday();
      var day30 = get30DayBottom();
      message = message + 'GA query submitted';
      res.status(200).send(message);
      break;
    case 'topic':
      console.log("handleGET: Publishing message to topic REFRESH_GA_DATA_TOPIC");

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
	//	var currentDt = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
	 var currentDt = new Date();
	  	var mm = currentDt.getMonth() + 1;
	  var dd = currentDt.getDate();
	  var yyyy = currentDt.getFullYear();
	  var hh = currentDt.getHours();
	  var min = currentDt.getMinutes();
	  var date = mm + '/' + dd + '/' + yyyy + ' ' + hh + ':' + min;  
	  storeValue("LastUpdated", date);

	}
	catch (ex)
	{
		console.error("writeTimestamp(): " + ex);
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
async function getValue(row)
{
  console.log("getValue row=" + row);

  const Datastore = require('@google-cloud/datastore');
  const projectId = 'api-project-73897325473';

  const datastore = Datastore({ projectId: projectId });

  const kind = 'GA';
  const gcskey = datastore.key([kind, row]);

  return datastore.get(gcskey)
    .then(([entity]) => {
      // The get operation will not fail for a non-existent entity, it just
      // returns an empty dictionary.
      console.log("getValue(" + row + ")=" + entity );
      if (!entity) {
        throw new Error(`No entity found for key ${key.path.join('/')}.`);
      }
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(err);
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
