import {json} from 'd3';
import getTribColors from'./getTribColors.js';
import CookCountyMap from './fairness.js';
// var d3 = require('d3');

const pym = require('pym.js');


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