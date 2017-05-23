import * as d3 from 'd3';
import getTribColors from './getTribColors.js'

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
// NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];


// (data, category, container)

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



class scatterlineSquare{
	constructor(options){

		let app = this;
		app.options = options;

		const bbox = d3.select(app.options.container).node().getBoundingClientRect(),
				circleRadius = app.options.circleRadius,
				height = bbox.height,
				width = bbox.width,
				margin = app.options.margin,
				innerHeight = height - margin.top - margin.bottom,
				innerWidth = width - margin.right - margin.left,
				data = app.options.data,
				category = app.options.categoryToChart,
				rectWidth = app.options.rectWidth,
				rectHeight = app.options.rectHeight;

		const axisFormat = "";

		const extent = d3.extent(data, d => parseFloat(d[category]));
			
		const scatterScale = d3.scaleLinear()
			.domain(extent)
			.range([0,innerWidth])
			.nice();

		// console.log(scatterScale, extent);

		const xAxis = d3.axisBottom(scatterScale)
		    .tickSize((rectHeight / 2) + 5)
		    .tickFormat(d3.format(axisFormat));


		// ----------------------------------
		// START MESSING WITH SVGs
		// ----------------------------------

		//Inserts svg and sizes it
		const svg = d3.select(app.options.container)
			.append("svg")
	        .attr("width", width)
	        .attr("height", height);

		const chartInner = svg.append('g')
			.classed('chartInner', true)
			.attr("width",innerWidth)
			.attr("height",innerHeight)
			.attr(`transform`,`translate(${margin.left},${margin.top})`);

		// svg.append('g')
		// 	.classed('x', true)
		// 	.classed('axis', true)
		// 	.attr(`transform`,`translate(${margin.left},${margin.top + (innerHeight / 2)})`)
		// 	.call(xAxis)
		// 	.selectAll('text').remove();

		
		// chartInner.append('line')
		// 	.classed('scatterline__line', true)
		// 	.attr('x1', 0)
		// 	.attr('x2', innerWidth)
		// 	.attr('y1', innerHeight / 2)
		// 	.attr('y2', innerHeight / 2)
		// 	.style('stroke', 'black')
		// 	.style('stroke-width', .2);

		chartInner.selectAll('rect')
			.data(data)
			.enter()
				.append('rect')
				.classed('scatterline__square', true)
				.classed('scatterline__square--over', d => {
					if (category.indexOf('ratio') > -1 && d[category] > 1) return true;
					return false;
				})
				// .style('fill', getTribColors('trib-blue2'))
				.style('opacity', .3)
				.attr('width', rectWidth)
				.attr('height', rectHeight)
				.attr('x', d => scatterScale(d[category]) - (rectWidth / 2))
				.attr('y', (innerHeight - rectHeight) / 2)
				.attr('data-value', d => d[category])
				.each( function(d, i) {
					if (category.indexOf('ratio') > -1) {
						if (d[category] > 1) {
							d3.select(this).attr('fill', getTribColors('trib-red2'));
						} else if (d[category] < 1) {
							d3.select(this).attr('fill', getTribColors('trib-orange'));	
						}else {
							d3.select(this).attr('fill', "black");	
						}
					} else {
						d3.select(this).attr('fill', getTribColors('trib-blue2'));
					} 
				});
	}
	
}

module.exports = scatterlineSquare;