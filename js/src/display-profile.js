import {format} from 'd3';

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];


function addGauge(value, formatter, scale, valueName){
	// This function generates a gauge chart, using pre-rendered d3 charts, to be included
	// in a census tract profile. It requires the value, and formatting function to display 
	// the value, the related scale to place axis tick values properly and the value name, so 
	// we can test for some exceptoins to our display (i.e. if it is a ratio, then we also want to highlight 1)
	
	const scaleDomain = scale.domain();
	
	console.log(scaleDomain);

	let profileString = `
		<div class='gauge'>
			<span class='gauge__label gauge__label--center' style='left:${scale(value)}%'>
				${formatter(value)}
			</span>
			<img class='gauge__triangle' style='left:${scale(value)}%' src='http://${ window.ROOT_URL }/img/triangle.svg' />
			<img class='gauge__chart' src='http://${ window.ROOT_URL }/img/ratio.svg' />`;

		// Now add the min and max. I would do it with a domain.forEach, but there only are two and each 
		// needs a slightly different treatment, so manual it is.
	
		profileString += `
			<span class='gauge__label gauge__label--axis' style='left:0'>
				${scaleDomain[0]}
			</span>`
		
		profileString += `
			<span class='gauge__label gauge__label--axis' style='right:0;text-align:right'>
				${scaleDomain[1]}
			</span>`


		// If the attribute is a ratio, then we want to highlight 1, whereever it is on the gauge.
		if (valueName.indexOf('ratio') > -1){
			profileString += `<span class='gauge__label gauge__label--axis gauge__label--center' style='left:${scale(1)}%'>1</span>`
		}

		return profileString + "</div>";
}

function displayProfile(feature, placeData){
	// Takes a geojson feature and nicely displays selected bits of tract data.
	// TODO: Add Township data
	
	const properties = feature.properties;
	console.log(properties);
	
	const formatters = {
		ratio: format('.2f'),
		currency: format('$,.2f'),
		currencyRounded: format('$,.0f'),
		percentage: format('.1%')
	}

	const placeName = placeData.address;

	document.getElementById('profile').innerHTML = `
	<h2 class='profile__address'>${placeName}</h2>
	<p class='profile__community-area'>${properties.community} community area</p>
	<h3 class='profile__sub-label profile__sub-label--tract'>${properties.NAMELSAD10}</h3>
	<dl class='profile__attributes profile__attributes--tract'>
		<dt>Median ratio of homes' assessed value to market value: </dt>
		<dd>
			${addGauge(properties.ratio,formatters.ratio, window.gaugeratio, "ratio")}
		</dd>
		<dt>Median home value ratio after any appeals:</dt>
		<dd class='gauge'>
			${addGauge(properties.ratio1,formatters.ratio, window.gaugeratio1, "ratio1")}			
		</dd>
		<dt>Assessed value:</dt>
		<dd>
			${addGauge(properties.value,formatters.currencyRounded, window.gaugevalue, "value")}			
		</dd>
		<dt>Taxes</dt>
		<dd>${formatters.currencyRounded(properties.taxes)}</dd>
		<dt>Appealed value: </dt>
		<dd>${formatters.currency(properties.av)}</dd>
		<dt>Median household income:</dt>
		<dd>${formatters.currencyRounded(properties.medhinc)}</dd>
		<dt>Percentage white, not hispanic:</dt>
		<dd>${formatters.percentage(properties.white)}</dd>
	</dl>`;

	// center the labels
	const gaugeLabels = document.querySelectorAll('.gauge__label--center');
	for (var gaugeLabel of gaugeLabels){
		const width = gaugeLabel.getBoundingClientRect().width
		gaugeLabel.style.marginLeft = `${width * -0.5}px`;
	}
}


module.exports = displayProfile;