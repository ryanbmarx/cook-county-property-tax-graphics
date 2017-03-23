var system = require('system'),
  	fs = require('fs'),
    webPage = require('webpage'),
    page = webPage.create();

//http://stackoverflow.com/questions/12555203/phantomjs-does-not-execute-function-in-page-evaluate-function
page.onConsoleMessage = function (msg) { console.log(msg); };

// Ripped from http://stackoverflow.com/questions/26609450/phantomjs-page-open-freezes
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';


page.onError = function (msg, trace) {
	// Ripped from http://phantomjs.org/troubleshooting.html
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};


page.open('http://127.0.0.1:5000/gauges.html', function(status){
	console.log('status: ', status);
	if (status == "success"){
		setTimeout(function(){
			var code = page.evaluate( function(){
				var elements = document.querySelectorAll("div");
				
				// Will house the code I want to make seperate files out of
				var code = [];

				// Loop through and find each chart, stashing it's SVG into an array of objects
				for (var i  = 0; i < elements.length; i++) {
					code.push({
						id:elements[i].id,
						code:elements[i].innerHTML
					})
				}
				return code;
			});
			
			console.log(code);
			for (var i=0; i<code.length; i++){
				console.log(i, code[i].id);
				fs.write("img/src/"+code[i].id + ".svg", code[i].code, 'w');
			}
			phantom.exit();
		}, 10000)
	} else {
		console.log("Error loading page. Maybe your server isn't running?");
	}
})