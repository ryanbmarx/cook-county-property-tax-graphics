import * as d3 from 'd3';
import scatterline from './scatterline.js';


window.onload = function(){


	d3.json(`http://${window.ROOT_URL}/data/tract-data2.geojson`, (err, data) => {
		if (err) throw err;
		console.log(data);
		

		const features = data.features;

		// flatten our data
			
		let scatterlineData = [];

		features.forEach(feature => {
			scatterlineData.push(feature.properties)
		})


		const divs = document.querySelectorAll('div');
		console.log(divs);
		for (var i=0; i< divs.length; i++){
			const div = divs[i];
			const category = div.dataset.chart;
			console.log(scatterlineData);

			const gauge = new scatterline({
				container: div,
				data: scatterlineData,
				categoryToChart:category,
				margin: {top:0,right:20,bottom:20,left:20},
				circleRadius: 4
			});
		}

	})
}