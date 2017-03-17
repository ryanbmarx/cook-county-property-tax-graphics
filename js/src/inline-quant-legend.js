import {formatSpecifier} from 'd3';
import {format} from 'd3';
import * as d3 from 'd3-selection';

function formatter(number){
	// Takes any number, and returns it as XXM, i.e 1,400,000 -> 1.4M
	return format('$.3s')(number);
}

function inlineQuantLegend(scale){
	

	const container = d3.select('#legend')
	if (container.node().childNodes.length > 0){
		container.selectAll('*').remove();
	}

	const 	divisions = scale.range().length,
			width = 100 / divisions;
	
	let bucketCounter = 0;

	scale.range().forEach( bucket =>{

		const bucketLabel = formatter(scale.invertExtent(bucket)[0]);

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
				.text(formatter(scale.invertExtent(bucket)[1]))
				.style('right', 0)
				.style('margin-left', 0);
		}
		
	})
}

module.exports = inlineQuantLegend;