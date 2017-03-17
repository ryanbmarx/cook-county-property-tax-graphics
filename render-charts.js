// var args = require('system').args,
//     page = require('webpage').create(),
//     fs = require('fs'),
//     url = args[1],
//   	d3 = require('d3');

var system = require('system'),
	fs = require('fs');
 
if (system.args.length != 3) {
    console.log("Usage: extract.js  ");
    phantom.exit(1);
}
 
var address = 09,
    elementID = 0,
    webpage = require('webpage'),
    page = webpage.create();
 
function serialize(elementID) {
    var serializer = new XMLSerializer();
    var element = document.getElementById(elementID);
    return serializer.serializeToString(element);
}
 
function extract(elementID) {
        page.render('screen.png');

  // return function(status) {
  //   if (status != 'success') {
  //     console.log("Failed to open the page.");
  //   } else {
  //     var output = page.evaluate(serialize, elementID);
  //     console.log(output);
  //     fs.write(`./img/${elementID}.html`, output, 'w');

  //   }
  phantom.exit();
  };
}
 
page.open('127.0.0.1:5000/gauges.html', function(status) {
  console.log('Status: ' + status);
  setTimeout(function(){
    page.render('screen.png');
  }, 5000);
});


// page.open('http://127.0.0.1:5000/_gauges.html', function() {

//   var title = page.evaluate(function() {
//     return document.title;
//   });

//   console.log('title is', title);


// 	var doc = page.evaluate(function() {
// 		return document.querySelectorAll('div');
// 	})

// 	console.log(doc, doc.length);

// 	for (var i = 0; i < doc.length; i++){
// 		var chart = doc[i]
// 		console.log(i, chart);
// 	// 	fs.write(`img/file${i}.html`, chart.innerHTML, 'w')
		
// 	}

// 	phantom.exit();
// })