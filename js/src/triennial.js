import * as d3 from 'd3';
import * as _ from 'underscore';

function filterData(rawData, category){
	// creates an array of two-key objects: the x and y values for our chart.
	let retval = [];
	rawData.forEach(datum => {
		retval.push({
			townName: datum['Descr'],
			town:datum['Town'],
			tri: datum['Tri'],
			y: parseFloat(datum[category]),
			x: parseInt(datum['TaxYear'])
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


function drawChart(rawData, container, category, chartTitle){
	// update the headline
	d3.select('.chart-headline').text(chartTitle);

	const bbox = container.node().getBoundingClientRect(),
		height = bbox.height,
		width = bbox.width,
		margin = {top: 0, right:0, bottom:20, left:60},
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
	console.log(data, container, category, chartTitle);

	const 	yExtent = d3.extent(data, d => d.y),
			yScale = d3.scaleLinear()
				.domain(yExtent)
				.range([innerHeight, 0]);


	const 	xExtent = d3.extent(data, d => d.x),
			xScale = d3.scaleTime()
			    .range([0, innerWidth])
			    .domain([new Date(xExtent[0], 1, 1), new Date(xExtent[1], 1, 1)]);

	const line = d3.line()
	    .y(d => yScale(d.y))
	    .x(d => xScale(new Date(d.x, 1, 1)));
	
	const xAxis = d3.axisBottom(xScale);

	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${innerHeight})`)
		.call(xAxis);


	const yAxis = d3.axisLeft(yScale);
	svg.append('g')
		.attr('class', 'y axis')
		.attr('transform', `translate(${margin.left}, 0)`)
		.call(yAxis);
	

function highlightLine(direction, d, i, line){
	console.log(direction, d, i, line);
	if (direction == "over"){
		d3.selectAll('.triennial')
			.style('opacity', .2);
		d3.select(line)
			.style('opacity', 1)
			.style('stroke-width', 3);

	} else {
		d3.selectAll('.triennial')
			.style('opacity', 1)
			.style('stroke-width', 1.5);
	}
	
}


	const uniqueListOfTowns = _.uniq(data, false, d => d.town);	
	uniqueListOfTowns.forEach(town => {
		const townData = filterToTown(data, town.town);
		
		chartInner.append("path")
			.datum(townData)
			.attr("fill", "none")
			// .attr("stroke", "steelblue")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.attr("d", line)
			.attr('class', d => {
				return `triennial triennial--${d[0]['tri']}`;
			})
			.attr('id', d => d[0]['town'])
            .on("mouseover", function(d,i){
            	console.log('hovering one');
            	highlightLine("over", d,i, this);
            })
            .on("mouseout", function(d,i){
            	console.log('hovering off');
            	highlightLine("off", d,i, this);
            });
	})


}

window.onload = function(){

	const 	container = d3.select('#triennial-chart'),
			category = "prd",
			categoryLookup = {
				Town :" Township ID",
				N :" Sample size",
				mv_sum :" Total market value (assessor)",
				netcon :" Total sale price (actual sales)",
				median_sales :" Median sale price",
				median_ass :" Median assessment level (as a percentage)",
				mad :" Median absolute deviation",
				weighted :" Weighted mean",
				prd :" Price-related differential",
				COD :" Coefficient of dispersion",
				Descr :" Township ID",
				TaxYear :" Tax year",
				Tri:"Triennial are"
			};

	d3.csv(`http://${window.ROOT_URL}/data/tri_stats.csv`, (err, triennialData) => {
		if (err) throw err;
		console.log('raw', triennialData);
		drawChart(triennialData, container, category, categoryLookup[category]);
	})
}