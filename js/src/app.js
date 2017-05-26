import * as L from "leaflet";
import 'leaflet-providers';
import {debounce} from 'underscore';
import {scaleLinear, json, max, min} from 'd3';
import {point, inside} from '@turf/turf';
import displayProfile from './display-profile.js';
var pym = require('pym.js');
import getCoord from './get-coord.js';
import * as utils from './geocoding-utils.js';



// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function drawMap(container, data, propertyToMap){
	// instantiates the leaflet map
	window.map =  L.map(container,
		{
			center: [41.804425, -87.915862],
			zoom: 9,
			scrollWheelZoom:false,
			maxZoom:16
		}
	);
	
	L.tileLayer.provider('Hydda.Full').addTo(map);
	// L.tileLayer.provider('OpenStreetMap.BlackAndWhite').addTo(map);
	// L.tileLayer.provider('Stamen.TonerBackground').addTo(window.map);
	// window.choroplethData = L.layerGroup().addTo(window.map);

	// Build the needed scales for our little ratio gauges
	var gaugeAttributes = [
		'taxes', 
		'ratio1', 
		'value',
		'av1', 
		'medhinc',
		'white',
		'erate',
		'appeal_fla'
	];
	gaugeAttributes.forEach(attribute => {
		const gMax = max(data['features'], d => {
			return parseFloat(d['properties'][attribute])
		});
		
		const gMin = min(data['features'], d => {
			return parseFloat(d['properties'][attribute])
		});

		window[`gauge${attribute}`] = scaleLinear()
			.range([0,100])
			.domain([gMin, gMax])
			.nice();
	});
}

function findTract(coordinates){
	// This function takes a pair of coordinates in [<long>, <lat>] format
	// and finds the corresponding census tract

	// Create a geojson point of the user's address, using turf so it's compatible with the turf analysis functions.
	const pointLoc = point(coordinates);

	for (var i=0; i< window.tractDataFeatures.length; i++){
		// For every feature (tract) in the data, test if the point is inside it.
		const tract = window.tractDataFeatures[i];

		if (inside(pointLoc, tract) ){
			// If the tract is the one we're looking for, then return our data object
			return {
				point: pointLoc,
				tract: tract
			};
		}
	}
	return false
}

function mapUserGeo(point, polygon){
	
	// Start by removing any existing user info
	if (window.userLayer) {
		window.map.removeLayer(window.userLayer);
	}

	// Create a layer group to house our user-specific geo features
	window.userLayer = L.layerGroup().addTo(window.map);

	// Add point to the map.
	L.geoJson(point,{
	    style: function (feature) {
	        return {
	        	className: 'user-point'
	        };
	    },
	    onEachFeature: function (feature, layer) {
        	// layer.bindPopup(feature.properties.description);
        }
    }).addTo(userLayer);

	// Add user's tract to the map
	L.geoJson(polygon, {
	    style: function (feature) {
	        return {
	        	className: 'user-tract'
	        };
	    },
	    onEachFeature: function (feature, layer) {
        	// layer.bindPopup(feature.properties.description);
        }
    }).addTo(userLayer);
	
	// Pan/Scan/Zoom the map so that it is centered on the point
	window.map.setView([point.geometry.coordinates[1],point.geometry.coordinates[0]], 13);
}

function startUpPym(){
	window.pymChild = new pym.Child({ polling: 500 });
	pymChild.sendHeight();
	pymChild.sendMessage('childLoaded');
}

// Listen for the loaded event then run the pym stuff.
window.addEventListener('load', function() {  
	startUpPym(); 
}, false);



window.addEventListener('load', function(e){

  	// Create a trigger to detect whether we are on a mobile width, which is < 450
  	// Also, keep monitoring the window width so when the profile finally is shown, 
  	// it fits the current width.
  	
  	function checkIfMobile(){
  		window.mobile = window.innerWidth < 450 ? true : false;
  	}
  	// Init the variable
	window.mobile = window.innerWidth < 450 ? true : false;
	// Keep tracking the variable
	window.onresize = debounce(checkIfMobile, 300)


	const mapContainer = document.getElementById('map');
	json(`http://${window.ROOT_URL}/data/tract-data2.geojson`, tractData => {
		window.tractDataFeatures = tractData.features;
		drawMap(mapContainer, tractData);
	});


	// The submit button which should geocode and trigger a profile
	document.getElementById('search-address-submit').addEventListener('click', e => {
		
		// Quash the default behavior
		e.preventDefault();

		// Get the input address from the form
		const address = document.getElementById('search-address').value;

		// Switch to loading spinner in case geocoding takes some time.
		utils.spinner('spinner');

		getCoord(address)
			.then(function(response) {
				
				const data = JSON.parse(response).resourceSets[0];
				if (data.estimatedTotal > 0) {
					// if the geocoding returns at least one entry, then
					// do this. This ain't no guarantee that the address 
					// is the correct one, but at least we know it's a real
					// address. Only in this case will we show a profile.
					
					// Start by clearing any existing error
					utils.triggerWarning("clear")

					const userCoordinates =  {
						address: data.resources[0].name,
						coordinates:[
							data.resources[0].geocodePoints[0].coordinates[1],
							data.resources[0].geocodePoints[0].coordinates[0]
						]
					}
					
					// Generate an object the with geojson for both the user's address and corresponding tract
					const userGeo = findTract(userCoordinates.coordinates);

					if (!userGeo){
						utils.triggerWarning("trigger", window.error_not_in_cook_county);
					} else {					
						// Map the user's geo stuff
						mapUserGeo(userGeo.point, userGeo.tract);
	
						// Call the profile function, sending it our desired tract
						displayProfile(userGeo.tract, userCoordinates);

						// Now that we have a a displayed profile, switch back to the submit arrow
						utils.spinner('arrow');
					}
				} else {
					// If the geocoding returned no entries
					utils.triggerWarning("trigger", window.error_not_found)
					
				}
				window.pymChild.sendHeight();
			}, function(error) {
				const userCoordinates = error;
			});

	});	

	// Reset the red/errored form after 300ms of typing to "clear" the error.
	document.getElementById('search-address').addEventListener('input', e => {
		setTimeout(function(){
			utils.spinner('arrow');
			utils.triggerWarning("clear")
		}, 300);
	});
});