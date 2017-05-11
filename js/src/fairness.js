// import * as d3 from 'd3';
var d3 = require('d3');
import getTribColors from'./getTribColors.js';
const queue = require('d3-queue').queue;
const debounce = require('lodash.debounce');

import * as topojson from 'topojson'

// https://github.com/fivethirtyeight/d3-pre
const Prerender = require('d3-pre');
const prerender = Prerender(d3);




const 	aboveOneColor = getTribColors('trib-red2'),
		otherColor = 'rgba(255,255,255,.3)',
		belowOneColor = getTribColors('trib-orange');

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];


function valueMapOpacityScale(ratio){
	// This is a super-simple custom scale to highlight the gradiations. 
	// If a ratio is close to 1, it gets a lighter opacity than ratios much larger/smaller than 1
	if (Math.abs(1 - ratio) < 0.1){
		return .65
	}
	return 1;
}


function valueMapScale(ratio){
	// This is a super-simple custom scale. If the value is greater than 1, return a color. If it
	// is less than 1, return a different color. If it is one, return white, or at least a very light grey;

	if (ratio > 1){
		return aboveOneColor
	} else if (ratio < 1 ){
		return belowOneColor
	}
	return otherColor;
}

function tracts(app){
	const 	containerBox = app.mapContainer.node().getBoundingClientRect(),
			width = containerBox.width,
			height = containerBox.height;

	// Nudge the map down to the center if we are one "desktop mode", which is 
	// when the window is wider than the map-wrapper's maximum width, which, 
	// at the time of this writing, is 600px;
	const 	mapWrapper = app.mapContainer.parentElement,
			mapMaxWidth = 600;

	// Remove old map
	app.mapContainer.selectAll('*').remove();

	// Put the svg inside the passed container
	const svg = app.mapContainer.append('svg')
				.attr("width", width)
				.attr("height", height)
				.attr("data-prerender-minify", true);

	// Create a unit projection.
	let projection = d3.geoMercator()
		.scale(1)
		.translate([0, 0]);

	const geoPath = d3.geoPath().projection(projection);

	// Compute the bounds of a feature of interest, then derive scale & translate.
	var bounds = geoPath.bounds(topojson.mesh(app.data, app.data.objects.tracts)),
		dx = bounds[1][0] - bounds[0][0],
		dy = bounds[1][1] - bounds[0][1],
		x = (bounds[0][0] + bounds[1][0]) / 2,
		y = (bounds[0][1] + bounds[1][1]) / 2,
		s = 1 / Math.max(dx / width, dy / height),
		t = [width / 2 - s * x, (height / 2 - s * y) - 0];
			
	// Update the projection to use computed scale & translate.
	projection
		.scale(s)
		.translate(t);

	// Create a container for the tract data
	const tracts = svg.append('g')
		.classed('tracts', true)
		.selectAll('.tracts')
					// topojson.feature, per the docs, returns the GeoJSON Feature or FeatureCollection 
			// for the specified object in the given topology. In this case, it's a collection,
			// which is why we call the features attribute after it.

		.data( topojson.feature(app.data, app.data.objects.tracts).features);


	tracts.enter()
		.append( "path" )
			.attr('data-name', d => d.properties.TRACT)
			.attr('class', 'tract')
			.attr( "d", geoPath)
			.style('fill', d => valueMapScale(d.properties.ratio))
			.style('opacity', d=> valueMapOpacityScale(d.properties.ratio));

	console.log('chicgao', topojson.feature(app.data, app.data.objects.chicago).features);
	
	svg.append('g')
		.classed('chicago', true)
		.selectAll('path')
		.data(topojson.feature(app.data, app.data.objects.chicago).features)
		.enter()
			.append( "path" )
			.attr( "d", geoPath)
			.style('fill', 'transparent')
			.style('stroke', 'white')
			.style('stroke-width', 3);
}


class CookCountyMap{
	constructor(options){

		 const app = this;
		 app.options = options;
		 app.mapContainer = d3.select(options.mapContainer);
		 app.data = options.data;
		 console.log(app.data);
		// define the layers of map data I want
		// Source of map base layers: http://code.highcharts.com/mapdata/
		 app.mapLayers =[
		 	{
		 		id:'chicago',
		 		url: `http://${window.ROOT_URL}/data/chicago-boundary.geojson`
		 	}
		 ];

 		const mapDataQueue = queue();
		app.mapLayers.forEach(layer => {
			mapDataQueue.defer(d3.json,layer.url);
		});

		mapDataQueue.awaitAll(app.drawMap.bind(app));
		// app.drawMap()
		// Generate a scale for the effective tax rate.
		// const erateExtent = d3.extent(app.data.features, d => d.properties.erate);
		// const erateColorRamp=['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'];
		// app.erateScale = d3.scaleQuantile()
		// 	.domain(app.data.features.map(d => d.properties.erate))
		// 	.range(erateColorRamp);
		// buildErateLegend(erateColorRamp, '#day1-header-display');


	}

	

	drawMap(){

		// Insert our extra map layers/add-ons into the array 
		const app = this;
		for (var i=0; i < arguments[1].length; i++ ){
			app.mapLayers[i].data = arguments[1][i];
		}


		tracts(app);
		const debounced = debounce(function(){tracts(app);}, 200);
		window.addEventListener('resize', debounced);
	}
}

module.exports = CookCountyMap;