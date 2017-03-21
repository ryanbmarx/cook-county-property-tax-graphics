import * as L from "leaflet";
import 'leaflet-providers';
import {scaleQuantize} from 'd3';
import {scaleLinear} from 'd3';
import {extent} from 'd3';
import {json} from 'd3';
import * as turf from '@turf/turf';
// import geocodeAddress from './geocode-address.js';
import displayProfile from './display-profile.js';
import choroplethRatioScale from './ratio-scale.js';
import inlineQuantLegend from './inline-quant-legend.js';
import * as d3 from 'd3';


// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function styleFeature(featureFillColor){
	// http://leafletjs.com/reference.html#path-options
	return {
		color: "#eee",
		stroke:true,
		weight:1,
		fillColor:featureFillColor,
		className:'tract',
		fillOpacity: .9
	};
}

function onEachFeature(feature, layer){
	// Everything in this function is executed on each feature.
	layer.id = feature.properties.NAME10;
	layer.bindPopup(feature.properties.NAMELSAD10);
}

function drawMap(container, data, propertyToMap){
	// instantiates the leaflet map
	window.map =  L.map(container,
		{
			center: [41.886635, -87.637839],
			zoom: 10,
			scrollWheelZoom:false,
			maxZoom:16
			// maxBounds:L.latLngBounds(L.latLng(36.590379, -92.133247),L.latLng(42.478624, -87.015605))
		}
	);
	
	// L.tileLayer.provider('Hydda.Full').addTo(map);
	// L.tileLayer.provider('OpenStreetMap.BlackAndWhite').addTo(map);
	L.tileLayer.provider('Stamen.TonerBackground').addTo(map);

	// Build the scales for our little ratio gauges
	console.log(data);
	var gaugeAttributes = ['ratio', 'ratio1', 'value'];
	gaugeAttributes.forEach(attribute => {
		console.log('making scale for', attribute);

		let max = d3.max(data['features'], d => {
			// console.log(d);
			return parseFloat(d['properties'][attribute])
		});
		
		let min = d3.min(data['features'], d => {
			// console.log(d);
			return parseFloat(d['properties'][attribute])
		});

		window[`gauge${attribute}`] = scaleLinear()
			.range([0,100])
			.domain([min, max])
			.nice();
	});
			

	
	redrawGeojson(data, propertyToMap);
}

function redrawGeojson(data, propertyToMap){
	// Adds the geojson data and styles it using a d3 scale for the choropleth
	console.log('adding tract data', data);
	console.log(propertyToMap);



	// Make a scale using the desired feature attriobute.
	const dataExtent = extent(data.features, d => parseFloat(d.properties[propertyToMap]));
	
	// If the property to map is one of the ratio values, then we need to use our custom 
	// ratio scale. If it isn't, go with a vanilla D3 scale. Do this by testing for the substring "ratio"
	// in the name of the property to map.
	let mapDataScale;
	if (propertyToMap.toUpperCase().includes('RATIO')){
		mapDataScale = choroplethRatioScale(dataExtent);
	} else {
		const hotRamp = [
			"#FFFFC4",
			"#F5F50A",
			"#EB964F",
			"#C11B17"
		]

		mapDataScale = scaleQuantize()
			.domain(dataExtent)
			.range(hotRamp);

		inlineQuantLegend(mapDataScale);
	}

	// Remove the existing choropleth layer, if it exists, because we want to put lovely new data onto it.
	
	if (window.map.hasLayer(choroplethData)){
		window.map.removeLayer(choroplethData);
	}

	// This applies the geojson to the map 
	let choroplethData = L.layerGroup();

	L.geoJSON(data, {
		style: function(feature){
			// console.log(mapDataScale(parseFloat(feature.properties[propertyToMap])), feature.properties[propertyToMap]);
			const 	featureFillColor = mapDataScale(parseFloat(feature.properties[propertyToMap]));
			// Returns a style object for each tract
			return styleFeature(featureFillColor);
		},
		onEachFeature: onEachFeature
	}).addTo(choroplethData);

	choroplethData.addTo(window.map);
}



function findTract(coordinates){
	// This function takes a pair of coordinates in [<long>, <lat>] format
	// and finds the corresponding census tract

	// Create a geojson point of the user's address, using turf so it's compatible with the turf analysis functions.
	const pointLoc = turf.point(coordinates);

	for (var i=0; i< window.tractDataFeatures.length; i++){
		// For every feature (tract) in the data, test if the point is inside it.
		const tract = window.tractDataFeatures[i];

		if (turf.inside(pointLoc, tract) ){
			// If the tract is the one we're looking for, then return our data object
			return {
				point: pointLoc,
				tract: tract
			};
		}
	}
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

window.onload = function(){
	const 	activeButton = document.querySelector('.map-button--active'),
			container = document.getElementById('map'),
			propertyToMap = activeButton.dataset.chart,
			mapButtons = document.querySelectorAll('.map-button');

	console.log(propertyToMap);

	json(`http://${window.ROOT_URL}/data/tract-data2.geojson`, tractData => {
		window.tractDataFeatures = tractData.features;
		drawMap(container, tractData, propertyToMap);

		for (var button of mapButtons){
			button.addEventListener('click', function(e) {
				e.preventDefault();
				console.log(document.querySelector('.map-button--active'));
				document.querySelector('.map-button--active').classList.remove('map-button--active');
				this.classList.add('map-button--active');
				redrawGeojson(tractData, this.dataset.chart);
			});
		}

		// menu.addEventListener('change', e => {
		// 	e.preventDefault();
		// 	let propertyToMap = e.target.value;
		// 	redrawGeojson(tractData, propertyToMap);
		// });
	});


	// The submit button which should geocode and trigger a profile
	document.getElementById('search-address-submit').addEventListener('click', e => {
		// Get the input address from the form
		const address = document.getElementById('search-address').value;

		// Convert it to coordinates in long/lat format, for turfJS compatibility
		//init promise
		//feed async function
		// handle result in promise.then()
		// const userCoordinates = geocodeAddress(address);
		

		function getCoord(address){
			return new Promise(function(resolve, reject){
				// Make the request

				const requestUrl = `https://qyf1ag22mj.execute-api.us-east-1.amazonaws.com/production/locations?q=${encodeURI(address)}&userLocation=41.8337329,-87.7321555`
				const geoRequest = json(requestUrl)

				var request = new XMLHttpRequest();
				request.open('GET', requestUrl);

				request.onload = function(){
					if (request.status == 200){
						// success
						resolve(request.response);
					} else {
						// Failure
						reject(Error('ERROR!'));
					}
				}
			    // Handle network errors
			    request.onerror = function() {
			      reject(Error("Network Error"));
			    };

			    // Make the request
			    request.send();
			});
		}


		getCoord(address)
			.then(function(response) {
				const data = JSON.parse(response);
				console.log(data);
				const userCoordinates =  {
					address: data.resourceSets[0].resources[0].name,
					coordinates:[
						data.resourceSets[0].resources[0].geocodePoints[0].coordinates[1],
						data.resourceSets[0].resources[0].geocodePoints[0].coordinates[0]
					]
				}

				// Generate an object the with geojson for both the user's address and corresponding tract
				const userGeo = findTract(userCoordinates.coordinates);

				// Map the user's geo stuff
				mapUserGeo(userGeo.point, userGeo.tract);

				// Call the profile function, sending it our desired tract
				displayProfile(userGeo.tract, userCoordinates);

			}, function(error) {
				const userCoordinates = error;
				console.error("User location geocoding failed", error);
			});

	});	
};