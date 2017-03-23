var system = require('system'),
  	fs = require('fs'),
    webPage = require('webpage'),
    page = webPage.create();


var oldHeader = `<svg width="280" height="28">`
var newHeader = `<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="280" height="28">`
var chart = 'ratio';
var url = 'http://graphics.chicagotribune.com/property-tax-assessments-map/gauges.html';


page.open(url, function(status) {
  console.log('Status: ' + status);
      console.log('Rendering image');

  // setTimeout(function(){
    
  //   console.log('Rendering image');
  //   page.render('screen.png');

  //   // var svg = page.evaluate(function(chart){
  //   //   return document.querySelector("#" + chart).innerHTML;
  //   // });

  //   // fs.write('img/src/' + chart + '.svg', svg, 'w');
   
  // }, 10000);
    phantom.exit();

});

