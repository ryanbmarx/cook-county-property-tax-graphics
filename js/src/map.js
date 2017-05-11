import {json} from 'd3';
import getTribColors from'./getTribColors.js';
import CookCountyMap from './fairness.js';
// var d3 = require('d3');

const pym = require('pym.js');

// // https://github.com/fivethirtyeight/d3-pre
// var Prerender = require('d3-pre');
// var prerender = Prerender(d3);
// prerender.start();


// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];


window.addEventListener('load', function(e){
	const pymChild = new pym.Child({});
	pymChild.sendHeight();

    json(`http://${window.ROOT_URL}/data/mapData.json`, (err, data) =>{
        const transitionDuration = 400;
        const headerMap = new CookCountyMap({
            mapContainer: document.getElementById('map'),
            data: data,
            transitionDuration: transitionDuration
        });    
    });  
})