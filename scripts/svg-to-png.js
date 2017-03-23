var Jimp = require('jimp');
var fs = require('fs');
var xmlserializer = require('xmlserializer');



fs.readFile(`./img/ratio.svg`, 'utf8', (err, data) => {
	console.log(data);
	var oldHeader = `<svg width="280" height="28">`
	var newHeader = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="280" height="28">`

	console.log(data.replace(oldHeader, newHeader));
	fs.writeFile('./img/ratio.svg', data.replace(oldHeader, newHeader));
});



// Jimp.read('./img/ratio.svg', function(err, pic){
// 	if (err) throw err;
// 	console.log('Picture loaded');
// })