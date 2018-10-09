$(document).ready(function () 
{

  $('#refresh-data').click(function () 
  {

    $('#Bottom30Pages').DataTable({
      ajax: {
        url: 'https://api-project-73897325473.appspot.com/api/last30days/bottompages',
        dataSrc: 'RowReport'
      },
      columns: [
          { data: 'pageTitle' },
          { data: 'pageviews' }
      ]
    });


    var pvsYesterday = $('#pvs-yesterday');
    var pvsLast30days = $('#pvs-last30days');

    $.getJSON('https://api-project-73897325473.appspot.com/api/yesterday/pageviews', function (data) 
    {
      console.log("API yesterday:" + data);

      /*
      var row = data.RowReport.map(function (item) {
        return row.key + ': ' + row.value;
      });
      */
      pvsYesterday.empty();
      pvsYesterday.text(data);
      /*
      if (items.length) {
        var content = '<li>' + items.join('</li><li>') + '</li>';
        var list = $('<ul />').html(content);
        showData.append(list);
      }
      */
    });

  $.getJSON('https://api-project-73897325473.appspot.com/api/last30days/pageviews', function (data) 
    {
      console.log("API Last30:" + data);

      pvsLast30days.empty();
      pvsLast30days.text(data);
    });

    pvsYesterday.text("Loading");
    pvsLast30days.text("Loading");
  });
});


/*

{
  "items": [
    {
      "key": "First",
      "value": 100
    },{
      "key": "Second",
      "value": false
    },{
      "key": "Last",
      "value": "Mixed"
    }
  ],
  "obj": {
    "number": 1.2345e-6,
    "enabled": true
  },
  "message": "Strings have to be in double-quotes."
}
*/