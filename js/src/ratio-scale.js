import {scaleQuantize} from 'd3'
import {format} from 'd3';
import * as d3 from 'd3-selection';


function buildRatioLegend(ext, scaleOver1, scaleUnder1){
	const container = d3.select('#legend')
	
	if (container.node().childNodes.length > 0){
		container.selectAll('*').remove();
	}

	const 	divisions = scaleOver1.range().length + scaleUnder1.range().length,
			width = 100 / divisions;
	let bucketCounter = 0;

	[scaleOver1, scaleUnder1].forEach( scale =>{
		scale.range().forEach( bucket =>{

			const bucketLabel = format('.2f')(scale.invertExtent(bucket)[0]);
			container.append('div')
				.classed('legend__box', true)
				.style('background', bucket)
				.style('left', `${bucketCounter * width}%`)
				.style('width', `${width}%`);

			const label = container.append('span')
				.classed('legend__label', true)
				.text(bucketLabel)

			if (bucketCounter == 0){
				label.style('left', 0)
					.style('margin-left', 0);
			} else {

				const labelWidth = label.node().getBoundingClientRect().width;
				
				label.style('left', `${bucketCounter * width}%`)
					.style('margin-left', `${labelWidth/-2}px`);
			}
			
			bucketCounter++;

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