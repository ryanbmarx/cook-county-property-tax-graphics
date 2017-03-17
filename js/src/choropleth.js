import {scaleQuantize} from 'd3-scale';
import {extent} from 'd3-array';
import * as d3 from 'd3-selection';
import * as L from "leaflet";
import 'leaflet-providers';
import inlineQuantLegend from './inline-quant-legend.js';

function styleFeature(featureFillColor, featureOpacityColor, featureStrokeColor, featureStrokeWeight){
	// http://leafletjs.com/reference.html#path-options
	return {
		color: "#eee",
		stroke:featureStrokeColor,
		weight:featureStrokeWeight,
		fillColor:featureFillColor,
		className:'tract',
		fillOpacity: featureOpacityColor
	};
}

function onEachFeature(feature, layer, tooltips){
	// Everything in this function is executed on each feature.
	if (tooltips != false && tooltips != undefined){
		layer.id = feature.properties[tooltips];
		layer.bindPopup(feature.properties[tooltips]);
	}
}

function cleanUpRamps(ramp){
	// Take a potential ramp and makes sure it's an array. The big exception being caught here is 
	// when the user inputs a single value. For instance, if the user wants all features to be one 
	// color, the input for colorRamp might just be "#eeeeee" when D3 would require ["#eeeeee"]. 
	// Other exceptions might be added in the future.

	if (Array.isArray(ramp)){
		// if it's an array, no worries. Keep firing a-holes.
		return ramp;
	} else {
		// For now, just assume it's a single value and return it as a length=1 array
		return [ramp];
	}
	
}

function addLegend(mapContainer, colorScale, opacityScale, formatString){
		console.log('adding legend');
		// append legend container, giving it the styles we need to properly contain
		const legendContainer = d3.select(mapContainer)
			.append('div')
			.classed('map__legend', true)
			.style('background','rgba(255, 255, 255, .8')
			.style('position','absolute')
			.style('left',0)
			.style('top',0)
			.style('z-index', 1000)
			.style('width','calc(100% - 55px)')
			.style('height','30px')
			.style('margin', '0 0 0 55px')
			.style('box-shadow', '-3px 3px 3px rgba(0,0,0,.25)');
		inlineQuantLegend(legendContainer, colorScale, opacityScale, formatString);
	}


/*
background: rgba(255, 255, 255, .8);
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 1000;
    width: calc(100% - 55px);
    height: 30px;
    margin-left: 55px;


*/

class ChicagoChropleth {
	constructor(options){
		const app = this;
		app.options = options;
		app.container = app.options.container;
		app.data = app.options.data;
		app.ROOT_URL = app.options.ROOT_URL != undefined ? app.options.ROOT_URL : "";
		app.tooltips = app.options.tooltipPropertyLabel;

		// This draws the base leaflet map
		app.initMap();

		// Prep the ramps for D3 quantize scales and add the geojson data
		app.colorRamp = cleanUpRamps(app.options.colorRamp)
		app.opacityRamp = cleanUpRamps(app.options.opacityRamp)
		app.drawGeojson(app.data, app.options.propertyToMap, app.colorRamp, app.opacityRamp)
	}

	initMap(){
		const app = this;
		app.container.style.position = 'relative';
		app.map =  L.map(app.container,
			{
				center: app.options.mapCenter,
				zoom: 10,
				scrollWheelZoom:false,
				maxZoom:16
			}
		);

		if (app.options.maxBounds != undefined){
			const max = app.options.maxBounds;
			app.map.setMaxBounds(L.latLngBounds(max[0], max[1]));
		}

		// L.tileLayer.provider('Hydda.Full').addTo(app.map);
		L.tileLayer.provider('OpenStreetMap.BlackAndWhite').addTo(app.map);
		// L.tileLayer.provider('Stamen.TonerBackground').addTo(app.map);
	}

	drawGeojson(data, propertyToMap, colorRamp, opacityRamp){
		const app = this;
		// Make a scale using the desired feature attriobute.
		const dataExtent = extent(data.features, d => parseFloat(d.properties[propertyToMap]));

		const mapColorScale = scaleQuantize()
			.domain(dataExtent)
			.range(colorRamp);

		const mapOpacityScale = scaleQuantize()
			.domain(dataExtent)
			.range(opacityRamp);

		// inlineQuantLegend(mapColorScale);

		// This applies the geojson to the map 
			L.geoJSON(data, {
				style: function(feature){
					// console.log(mapColorScale(parseFloat(feature.properties[propertyToMap])), feature.properties[propertyToMap]);
					const 	featureFillColor = mapColorScale(parseFloat(feature.properties[propertyToMap])),
							featureFillOpacity = mapOpacityScale(parseFloat(feature.properties[propertyToMap])),
							featureStrokeColor = app.options.propertyStrokeColor,
							featureStrokeWeight = app.options.propertyStrokeWeight;

					// Returns a style object for each tract
					return styleFeature(featureFillColor, featureFillOpacity, featureStrokeColor, featureStrokeWeight);
				},
				onEachFeature: onEachFeature(app.tooltips)
			}).addTo(app.map);

		if (app.options.addLegend == true) {
			// if legends are enables in the options, then add one.
			addLegend(app.container, mapColorScale, mapOpacityScale, app.options.legendFormatString);
		}
	}
}


module.exports = ChicagoChoropleth