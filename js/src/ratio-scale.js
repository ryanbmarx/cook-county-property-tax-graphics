import {scaleQuantize} from 'd3'
import {format} from 'd3';
import * as d3 from 'd3-selection';


function buildRatioLegend(ext, scaleOver1, scaleUnder1){
	// Out legend container
	const container = d3.select('#legend')
	
	// Clear out the container, if it is full. 
	if (container.node().childNodes.length > 0){
		container.selectAll('*').remove();
	}

	// Figure out how many different boxes we will need 
	// (i.e. how many buckets are there between the two scales?).
	const 	divisions = scaleOver1.range().length + scaleUnder1.range().length,
			width = 100 / divisions;

	// Initialize the counter, so we know how many/which bucket we're on OVERALL 
	let bucketCounter = 0;

	// We will be taking the two different components from the custom ratio scale and creating
	// "mini legends" which get masehed up against each other to create the illustion of a single scale.
	// FIRST, make a little loop which traverses both scales.
	[scaleOver1, scaleUnder1].forEach( scale =>{
		scale.range().forEach( bucket =>{

			// This is the formatted text to label the left end of the bucket.
			const bucketLabel = format('.2f')(scale.invertExtent(bucket)[0]);
			
			// This is the colored box.
			container.append('div')
				.classed('legend__box', true)
				.style('background', bucket)
				.style('left', `${bucketCounter * width}%`) // We calculated the width as a percentage above. 
				.style('width', `${width}%`);

			// This is the acutal label item
			const label = container.append('span')
				.classed('legend__label', true)
				.text(bucketLabel)

			// If it's the first overall label, rather than center it over the edge of the box,
			// We're going to pin it to the left edge. This keeps everything neat and tidy.
			if (bucketCounter == 0){
				label.style('left', 0)
					.style('margin-left', 0);
			} else {
				// If it is not the first overall, then the label is something we want horizontally
				// centered at it's spot, so we find the item's width and set a negative margin of half 
				// that value on the left.

				const labelWidth = label.node().getBoundingClientRect().width;				
				label.style('left', `${bucketCounter * width}%`)
					.style('margin-left', `${labelWidth/-2}px`);
			}
			
			// If the label is 1, we want to get the horizontal placement of that label for our 
			// "over" and "under" accent/emphatic labels.
			if(scale.invertExtent(bucket)[0] == 1){
				const underValued = container.append('span')
					.html('&laquo; Under-valued')
					.attr('class', 'ratio-scale-label ratio-scale-label--under-valued')
					.style('left', `${bucketCounter * width}%`);
				// Now let's get the width of the undervalued label so we can right align it on the '1' line.
				// The labels have a 5px cushion from center;
				const underValuedWidth = underValued.node().getBoundingClientRect().width;
				underValued.style('margin-left', `${(underValuedWidth * -1) - 5}px`);

				container.append('span')
					.html('Over-valued &raquo;')
					.attr('class', 'ratio-scale-label ratio-scale-label--over-valued')
					.style('left', `${bucketCounter * width}%`);
			}
			// Advance our bucket counter.
			bucketCounter++;

			// This script only deals with the first value of each bucket's range, but to punctuate the end,
			// we need to label the last edge of the last bucket. If this is the last bucket, then do it.
			if (bucketCounter == divisions){
				container.append('span')
					.classed('legend__label', true)
					.text(format('.2f')(scale.invertExtent(bucket)[1]))
					.style('right', 0)
					.style('margin-left', 0);
			}
			
		})
	})
	
}

function choroplethRatioScale(ext){

	// This function creates a pseudo scale for choropleth maps of the housing ratio data. We want to highlight
	// values that are higher than 1 with one color ramp and values less than 1 with another. We accomplish this by 
	// creating two d3 scales and stitching them together with a master function.
	

	// Color ramp for the homes assessed at higher than their values. These people are getting screwed, ergo hot ramp
	const rampOver1 = [
		// "#FFFFC4",
		"#F5F50A",
		// "#EB964F",
		"#C11B17"
	];

	const scaleOver1 = scaleQuantize()
		.domain([1, ext[1]])
		.range(rampOver1);

	// These people are not getting screwed ... homes assessed at less than market rate. cool ramp.
	const rampUnder1 = [
		"#004E87",
		// "#85B4D3",
		"#CBDDED"
	];

	const scaleUnder1 = scaleQuantize()
		.range(rampUnder1)
		.domain([ext[0],1]);


	function ratioScale(value){
		// This function is what gets returned to the instance, and it manages the two seperate scale functions.
		if (value > 1){
			return scaleOver1(value);
		} else if (value < 1) {
			return scaleUnder1(value);
		} else {
			return "#ffffff";
		}
	}

	// Build the legend here, because this is where all the parts of our custom scale live. We need
	// access to those parts to make the scale, I'm pretty sure.
	buildRatioLegend(ext, scaleUnder1, scaleOver1);

	return ratioScale;
}

module.exports = choroplethRatioScale;