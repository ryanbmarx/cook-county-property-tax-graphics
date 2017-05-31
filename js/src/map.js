
const pym = require('pym.js');


window.addEventListener('load', function(e){
	const pymChild = new pym.Child({});
	pymChild.sendHeight();

})