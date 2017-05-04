import {json} from 'd3';
import getTribColors from'./getTribColors.js';
import CookCountyMap from './fairness.js';
const pym = require('pym.js');

// // https://github.com/fivethirtyeight/d3-pre
// var Prerender = require('d3-pre');
// var prerender = Prerender(d3);

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// function mapScale(ratio){
// 	// This is a super-simple custom scale. If the value is greater than 1, return a color. If it
// 	// is less than 1, return a different color. If it is one, return white, or at least a very light grey;

// 	const 	aboveOneColor = getTribColors('trib-red2'),
// 			oneColor = getTribColors('trib-gray4'),
// 			belowOneColor = getTribColors('trib-blue4');

// 	if (ratio == 1){
// 		return oneColor
// 	}
// 	return ratio > 1 ? aboveOneColor : belowOneColor;
// }





window.addEventListener('load', function(e){
	const pymChild = new pym.Child({});
	pymChild.sendHeight();


    json(`http://${window.ROOT_URL}/data/day1header.geojson`, (err, data) =>{
        const transitionDuration = 400;
        const headerMap = new CookCountyMap({
            mapContainer: document.getElementById('map'),
            data: data,
            transitionDuration: transitionDuration
        });    
    });  
})