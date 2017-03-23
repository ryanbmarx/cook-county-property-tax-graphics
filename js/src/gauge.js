import * as d3 from 'd3';
import scatterlineSquare from './scatterline-square.js';

window.onload = function(){
	d3.json(`http://${window.ROOT_URL}/data/tract-data2.geojson`, (err, data) => {
		if (err) throw err;

		const features = data.features;

		// flatten our data by removing all the geo stuff.
			
		let scatterlineData = [];

		features.forEach(feature => {
			scatterlineData.push(feature.properties)
		})


		const divs = document.querySelectorAll('div');
		// console.log(divs);
		for (var i=0; i< divs.length; i++){
			const div = divs[i];
			const category = div.dataset.chart;
			const bbox = divs[i].getBoundingClientRect();
			// console.log(scatterlineData);

			const gauge = new scatterlineSquare({
				container: div,
				data: scatterlineData,
				categoryToChart:category,
				margin: {top:0,right:0,bottom:0,left:0},
				rectHeight: bbox.height,
				rectWidth:3
			});
		}

	})
}