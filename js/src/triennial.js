import * as d3 from 'd3';
import * as _ from 'underscore';
import getTribColor from './getTribColors.js'

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
	// console.log(direction, d, i, line);
	const 	transitionDuration = 400;

	if (town == "all" ){

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

		const yearsString = `${townLine.node().dataset.yearFirst}-${townLine.node().dataset.yearLast - 2000}`;
		d3.select('.notation__big-number').node().innerHTML = townLine.node().dataset.codChange;
		d3.select('.notation__years').node().innerHTML = yearsString;
		d3.select('.notation')
			.transition()
			.duration(transitionDuration)
			.style('opacity', 1)

	}
}

function drawChart(rawData, container, category, chartTitle){
	// update the headline
	
	console.log(rawData, container, category, chartTitle);

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
	console.log(data);
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
	
	// // Build the notation box
	// const notation = svg.append('g')
	// 	.attr('class', 'notation')
	// 	.attr('transform', `translate(${margin.left}, ${margin.top})`);


	// const 	xPos = innerWidth * .75,
	// 		yPos = 25,
	// 		rectWidth = 200,
	// 		rectHeight = 72,
	// 		rectPadding = 10;

	// notation.append('rect')
	// 	.classed('notation__background', true)
	// 	.attr('x', xPos - rectPadding)
	// 	.attr('y', yPos - rectPadding)
	// 	.attr('width', rectWidth + rectPadding + rectPadding)
	// 	.attr('height', rectHeight + rectPadding + rectPadding);
		

	// notation.append('text')
	// 	.classed('notation__big-number', true)
	// 	.attr('x', xPos)
	// 	.attr('y', yPos)
	// 	.attr('dy', '1em')
	// 	.html('-99.9');

	// notation.append('text')
	// 	.classed('notation__years', true)
	// 	.attr('x', xPos)
	// 	.attr('y', yPos + 45)
	// 	.attr('dy', '1em')
	// 	.html('Change XXXX-XX');


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

	// chartInner.append('text')
	// 	.classed('chart__township-label', true)
	// 	.attr('x', 15)
	// 	.attr('y', 15)



	const uniqueListOfTowns = _.uniq(data, false, d => d.town);	
	console.log(uniqueListOfTowns);
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
            // .each((d,i) => {
            // 	console.log(d, i, this)
            // 	const 	currentLine = d3.select(this),
            // 			last = d.length - 1;
            	
            // })

	})

	chartInner.append('line')
		.attr('x1', xScale(2010.9))
		.attr('y1', 0)
		.attr('x2', xScale(2010.9))
		.attr('y2', innerHeight)
		.style('stroke', 'black')
		.style('stroke-width', 1)
		.style('stroke-dasharray', 4);

	chartInner.append('text')
		.classed('label--2009', true)
		.attr('x', xScale(2010.9) + 3)
		.attr('y', innerHeight - 25)
		.attr('text-anchor', 'start')
		.html('&#9666; Dec. 6, 2010: Berrios takes office')

	const 	mugSize = 76,
			mugXPos = xScale(2010.9);
			
	chartInner.append('image')
		.attr('width', mugSize)
		.attr('height', mugSize)
		.attr('x', mugXPos + 17)
		.attr('y', innerHeight - mugSize - 45)
		.attr('xlink:href', `http://${window.ROOT_URL}/img/berrios-mug-circle.png`);
	
	chartInner.append('circle')
		.attr('width', mugSize)
		.attr('height', mugSize)
		.attr('cx', mugXPos + 17 + (mugSize/2))
		.attr('cy', innerHeight - (mugSize / 2) - 45)
		.attr('r', mugSize / 2)
		.style('stroke', getTribColor('trib-grey4'))
		.style('stroke-width',5)
		.style('fill','transparent');

}

// document.querySelector('#highlightButton').addEventListener('click', e => {
// 	highlightLine("72");
// });

document.querySelector('#townshipSelect').addEventListener('change', e => {
	const selectedTownship = e.target.value;
	highlightLine(selectedTownship);
});

window.addEventListener('load', function(e){

	const 	container = d3.select('#triennial-chart'),
			category = "cod",
			categoryLookup = {
				town :" Township ID",
				n :" Sample size",
				mv_sum :" Total market value (assessor)",
				netcon :" Total sale price (actual sales)",
				median_sales :" Median sale price",
				median_ass :" Median assessment level (as a percentage)",
				mad :" Median absolute deviation",
				weighted :" Weighted mean",
				prd :" Price-related differential",
				cod :" Coefficient of dispersion",
				descr :" Township ID",
				tax_year :" Tax year",
				tri:"Triennial are"
			};

	d3.csv(`http://${window.ROOT_URL}/data/tri_stats.csv`, (err, triennialData) => {
		if (err) throw err;
		drawChart(triennialData, container, category, categoryLookup[category]);
	})
});