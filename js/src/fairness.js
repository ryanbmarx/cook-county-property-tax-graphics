import * as d3 from 'd3';
import getTribColors from'./getTribColors.js';
const debounce = require('lodash.debounce');

import * as topojson from 'topojson'

const 	aboveOneColor = getTribColors('trib-red2'),
		otherColor = 'rgba(255,255,255,.3)',
		belowOneColor = getTribColors('trib-orange');

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
		app.drawMap();
	}

	drawMap(){
		const app = this;
		tracts(app);
		const debounced = debounce(function(){tracts(app);}, 200);
		window.addEventListener('resize', debounced);
	}
}

module.exports = CookCountyMap;