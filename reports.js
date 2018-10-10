var dataHelper = require('./data.js');
const {google} = require('googleapis');


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
      dataHelper.storeValue("Yesterday.Pageviews", pv.toString() );

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
            'dimensionFilterClauses': [
                {'filters': [
                    {'dimensionName': "ga:pageTitle",
                     'operator': "PARTIAL",
                     'not': true,
                     'expressions' : ["searched"]
                    },
                    {'dimensionName' : "ga:pageTitle",
                     'not' : true,
                     'operator' : "PARTIAL",
                     'expressions' : ["Archives"]
                    }
                ]}
            ],
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
      dataHelper.storeValue("Last30Days.Pageviews", pv.toString() );

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

// 2008-10-01

function getYearAgoBottom()
{
  console.log("get30DayBottom(): Sending GA Request");

  var viewID = "65651086";
  let basic_report = {
    'reportRequests': [
          {
            'viewId': viewID,
            'dateRanges': [{'startDate': '365daysago', 'endDate': 'today'}],
            'metrics': [{'expression': 'ga:pageviews'}]
        },
        {
            'viewId': viewID,
            'dateRanges': [{'startDate': '30daysago', 'endDate': 'today'}],
            'metrics': [{'expression': 'ga:pageviews'}],
            'dimensions' : [{'name' : 'ga:pageTitle'}],
            'dimensionFilterClauses': [
                {'filters': [
                    {'dimensionName': "ga:pageTitle",
                     'operator': "PARTIAL",
                     'not': true,
                     'expressions' : ["searched"]
                    },
                    {'dimensionName' : "ga:pageTitle",
                     'not' : true,
                     'operator' : "PARTIAL",
                     'expressions' : ["Archives"]
                    }
                ]}
            ],
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
      dataHelper.storeValue("Last30Days.Pageviews", pv.toString() );

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
  var subpv = 0;

	var key = 'RowReport';
	o[key] = []; // empty Array, which you can push() values into

	for(var index in pagerows) {
         // console.log("buildJSON(): Dimensions=" + pagerows[index]["dimensions"]);
         // console.log("buildJSON(): Pageviews=" + pagerows[index]["metrics"][0]["values"]);

          var rowpv = pagerows[index]["metrics"][0]["values"];
          subpv += parseInt(rowpv);
          //console.log('buildJSON(): PV so far: ' + subpv );
          var row = {
          	pageTitle: pagerows[index]["dimensions"],
          	pageviews: rowpv
          } 

          if (subpv <= maxpv) {
            o[key].push(row);  
          }
    } 
    console.log( JSON.stringify(o) );
    dataHelper.storeValue("Last30Days.BottomPages", JSON.stringify(o) );
}

function writeTimestamp()
{
	try {

    //var moment = require('moment');
    var moment = require('moment-timezone');

    moment.tz.setDefault("America/Chicago");
    var now = moment().format("MM/DD/YYYY HH:mm");
    console.log("writeTimestamp() Moment returns " + now);
    dataHelper.storeValue("LastUpdated", now);

	}
	catch (ex)
	{
		console.error("writeTimestamp() Error: " + ex.stack);
	}

}

module.exports = {getYesterday, get30DayBottom, writeTimestamp, buildJSON }