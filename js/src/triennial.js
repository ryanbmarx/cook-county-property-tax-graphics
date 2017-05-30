import * as d3 from 'd3';
import * as _ from 'underscore';
import getTribColor from './getTribColors.js';
import getCoord from './get-coord.js';
import * as utils from './geocoding-utils.js';
import {point, inside} from '@turf/turf';
const pym = require('pym.js');
import {feature} from 'topojson';

NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function filterData(rawData, category){
	// creates an array of two-key objects: the x and y values for our chart.
	let retval = [];
	rawData.forEach(datum => {
		retval.push({
			townName: datum['descr'],
			town:datum['town'],
			tri: datum['tri'],
			y: parseFloat(datum[category]),
			x: parseInt(datum['tax_year'])
		});
	})
	return retval;
}

function filterToTown(data, town){
	// peels off data to make a line for just one town
	const retval = [];
	data.forEach(datum => {
		if (datum.town == town){
			retval.push(datum);
		}
	})
	return retval;
}

function highlightLine(town){
	// console.log(town);
	const 	transitionDuration = 400;

	// Change the select menu to geocoded township
	// console.log(document.querySelector(`#townshipSelect`).value);
	
	document.querySelector(`#townshipSelect`).value = town;

	if (String(town).indexOf("all") > -1 ){

		d3.selectAll('.triennial')
			.transition()
			.duration(transitionDuration)
			.style('stroke-width', 1)
			.style('opacity', 1);

		d3.select('.notation')
			.transition()
			.duration(transitionDuration)
			.style('opacity', 0)

	} else {
		/*
		On May 20, 2017, at 7:23 PM, Grotto, Jason <jgrotto@chicagotribune.com> wrote:

		1 = City (Chicago)
		2 = North Suburban
		3 = South and West Suburban
		*/


		const 	townLine = d3.select(`path[data-town="${ town }"]`),
				tri = townLine.node().dataset.tri,
				townName = townLine.node().dataset.townName;

		d3.select('.chart__township-label').text(`${townName} Township`);
		d3.select('.chart__township-sublabel').text(`With triennial grouping ${tri}`);

		d3.selectAll('.triennial')
			.transition()
			.duration(transitionDuration)
			.style('stroke-width', 1)
			.style('opacity', 0);

		d3.selectAll(`.triennial[data-tri="${ tri }"]`)
			.transition()
			.duration(transitionDuration)
			.style('opacity', .25)
			.style('stroke-width', 1);
		
		townLine
			.transition()
			.duration(transitionDuration)
			.style('opacity', 1)
			.style('stroke-width', 3);

		// const yearsString = `${townLine.node().dataset.yearFirst}-${townLine.node().dataset.yearLast - 2000}`;
		// d3.select('.notation__big-number').node().innerHTML = townLine.node().dataset.codChange;
		// d3.select('.notation__years').node().innerHTML = yearsString;
		// d3.select('.notation')
		// 	.transition()
		// 	.duration(transitionDuration)
		// 	.style('opacity', 1)

	}
}

function drawChart(rawData, container, category, chartTitle){


	const bbox = container.node().getBoundingClientRect(),
		height = bbox.height,
		width = bbox.width,
		margin = {top: 0, right:20, bottom:20, left:20},
		innerHeight = height - margin.top - margin.bottom,
		innerWidth = width - margin.right - margin.left;

	const svg = container.append('svg')
		.style('height', height)
		.style('width', width);

	const chartInner = svg.append('g')
		.classed('chart-inner', true)
		.style('height', innerHeight)
		.style('width', innerWidth)
		.attr('transform', `translate(${margin.left}, ${margin.top})`);


	const data = filterData(rawData, category);
	const 	yExtent = d3.extent(data, d => d.y),
			yScale = d3.scaleLinear()
				.domain([0,yExtent[1]])
				.range([innerHeight, 0]);


	const 	xExtent = d3.extent(data, d => d.x),
			xScale = d3.scaleLinear()
			    .range([0, innerWidth])
			    .domain(xExtent)


	const 	line = d3.line()
			    .y(d => yScale(d.y))
			    .x(d => xScale(d.x));
	
	const 	xAxis = d3.axisBottom(xScale)
				.tickFormat(d3.format("d"));
	
	if (window.innerWidth >= 450){
		xAxis.ticks(10);
	} else {
		xAxis.ticks(5);
	}
	
	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(${margin.left}, ${innerHeight})`)
		.attr('width', innerWidth)
		.call(xAxis);


	const yAxis = d3.axisLeft(yScale);
	svg.append('g')
		.attr('class', 'y axis')
		.attr('transform', `translate(${margin.left}, 0)`)
		.call(yAxis);


	// Add the acceptable range box before we draw the lines

	chartInner.append('rect')
		.attr('x', 0)
		.attr('y', yScale(15))
		.attr('height', yScale(5) - yScale(15))
		.attr('width', innerWidth)
		.classed('acceptable-range', true)

	chartInner.append('text')
		.classed('acceptable-range-label', true)
		.attr('x', 15)
		.attr('y', yScale(5) - 15)
		.text('Acceptable range')




	const uniqueListOfTowns = _.uniq(data, false, d => d.town);	
	// console.log(uniqueListOfTowns);
	uniqueListOfTowns.forEach(town => {
		const townData = filterToTown(data, town.town);
		chartInner.append("path")
			.datum(townData)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.attr('data-tri', d => d[0]['tri'])
			.attr('data-town', d => d[0]['town'])
			.attr('data-town-name', d => d[0]['townName'])
			.attr("d", line)
			.attr('class', d => {
				return `triennial triennial--${d[0]['tri']}`;
			})
			.attr('data-year-first', d => d[0]['x'])
        	.attr('data-year-last', d => d[d.length - 1]['x'])
        	.attr('data-cod-first', d => d[0]['y'])
        	.attr('data-cod-last', d => d[d.length - 1]['y'])
        	.attr('data-cod-change', d => d3.format('.1f')(d[0]['y'] - d[d.length - 1]['y']))
            .on("click", (d,i) => {
   				const township = d[0]['town']
   				document.querySelector(`#townshipSelect option[value="${township}"]`).selected = "selected"
   				highlightLine(township);
            })
	})

	chartInner.append('line')
		.attr('x1', xScale(2008))
		.attr('y1', 0)
		.attr('x2', xScale(2008))
		.attr('y2', innerHeight)
		.style('stroke', 'black')
		.style('stroke-width', 1)
		.style('stroke-dasharray', 4);

	chartInner.append('text')
		.classed('label--2010', true)
		.attr('x', xScale(2008) - 3)
		.attr('y', innerHeight - 25)
		.attr('text-anchor', 'end')
		.style('font-family', "'Arial', sans-serif")
		.style('font-size', "13px")
		.attr('dy', '-0.1em')
		.html('2008: Housing&#9656;')

	chartInner.append('text')
		.classed('label--2010', true)
		.attr('x', xScale(2008) - 8)
		.attr('y', innerHeight - 25)
		.attr('text-anchor', 'end')
		.style('font-family', "'Arial', sans-serif")
		.style('font-size', "13px")
		.attr('dy', '1.2em')
		.html('market collapses')
}

document.querySelector('#townshipSelect').addEventListener('change', e => {
	const selectedTownship = e.target.value;
	highlightLine(selectedTownship);
});

window.addEventListener('load', function(e){

	const pymChild = new pym.Child({});
	pymChild.sendMessage('childLoaded');
	pymChild.sendHeight();

	const 	container = d3.select('#triennial-chart'),
			category = "cod";
			

	// TODO !!! d3-queue;
	d3.csv(`http://${window.ROOT_URL}/data/tri_stats.csv`, (err, triennialData) => {
		if (err) throw err;
		d3.json(`http://${window.ROOT_URL}/data/cook-county-townships-topo.json`, (err, townshipGeoData) => {
			if (err) throw err;
			const geojson = feature(townshipGeoData, townshipGeoData.objects.townships);
			window.townshipGeoData = geojson;

			drawChart(triennialData, container, category);
		});
	})
});


function findTownship(coordinates){
	// This function takes a pair of coordinates in [<long>, <lat>] format
	// and finds the corresponding census tract
	const twpLookup = [
		{id:0, label: "all"},
		{id:10, label: "Barrington"},
		{id:11, label: "Berwyn"},
		{id:12, label: "Bloom"},
		{id:13, label: "Bremen"},
		{id:14, label: "Calumet"},
		{id:15, label: "Cicero"},
		{id:16, label: "Elk Grove"},
		{id:17, label: "Evanston"},
		{id:18, label: "Hanover"},
		{id:70, label: "Hyde Park"},
		{id:71, label: "Jefferson"},
		{id:72, label: "Lake"},
		{id:73, label: "Lake View"},
		{id:19, label: "Lemont"},
		{id:26, label: "Leyden"},
		{id:21, label: "Lyons"},
		{id:22, label: "Maine"},
		{id:23, label: "New Trier"},
		{id:24, label: "Niles"},
		{id:74, label: "North"},
		{id:25, label: "Northfield"},
		{id:20, label: "Norwood Park"},
		{id:27, label: "Oak Park"},
		{id:28, label: "Orland"},
		{id:29, label: "Palatine"},
		{id:30, label: "Palos"},
		{id:31, label: "Proviso"},
		{id:32, label: "Rich"},
		{id:33, label: "River Forest"},
		{id:34, label: "Riverside"},
		{id:75, label: "Rogers Park"},
		{id:35, label: "Schaumburg"},
		{id:76, label: "South"},
		{id:36, label: "Stickney"},
		{id:37, label: "Thornton"},
		{id:77, label: "West"},
		{id:38, label: "Wheeling"},
		{id:39, label: "Worth"}
	];
	// Create a geojson point of the user's address, using turf so it's compatible with the turf analysis functions.
	const pointLoc = point(coordinates);
	let retval = false
	for (var i=0; i< window.townshipGeoData.features.length; i++){
		// For every feature (twp) in the data, test if the point is inside it.
		const township = window.townshipGeoData.features[i];
		if (inside(pointLoc, township) ){
			// console.log("the township feature is", township);
			// console.log("the township's name is", township.properties.name);
			// If we have found the geometry that contains the point, then search our lookup for the needed id so we can highlight the line
			for (let i = 0; i < twpLookup.length; i++) {
				const 	searchingTownship = twpLookup[i].label.toUpperCase(),
						foundTownship = township.properties.name;
				
				// console.log(twpLookup[i], searchingTownship, foundTownship, searchingTownship == foundTownship);

				if (searchingTownship == foundTownship) {
					// console.log('true!', twpLookup[i].id)
					retval = twpLookup[i].id;
					break;
				};
			}
		}
	}
	return retval
}

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
				// console.log('returned loc', userCoordinates);
				// Generate an object the with geojson for both the user's address and corresponding tract
				const userGeo = findTownship(userCoordinates.coordinates);
				// const userGeo = false;
				if (!userGeo){
					utils.triggerWarning("trigger", window.error_not_in_cook_county);
				} else {		
					// console.log("Township id is ", userGeo);			
					// Now that we have a a displayed profile, switch back to the submit arrow
					utils.spinner('arrow');

					// Highlight the line we want
					highlightLine(userGeo);
				}
			} else {
				// If the geocoding returned no entries
				utils.triggerWarning("trigger", window.error_not_found)
				
			}
			// window.pymChild.sendHeight();
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