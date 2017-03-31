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
	
	// console.log(scaleDomain);

	let profileString = `
		<div class='gauge'>
			<span class='gauge__label gauge__label--center' style='left:${scale(value)}%'>
				${formatter(value)}
			</span>
			<svg class='gauge__triangle' style='left:${scale(value)}%' viewBox="0 0 25 25" ><use xlink:href="#triangle" /></svg>
			<svg class='gauge__chart' preserveAspectRatio="none" viewBox="0 0 280 15" ><use xlink:href="#${valueName}" /></svg>`;			

		// Now add the min and max. I would do it with a domain.forEach, but there only are two and each 
		// needs a slightly different treatment, so manual it is.
	
		profileString += `
			<span class='gauge__label gauge__label--axis' style='left:0'>
				${formatter(scaleDomain[0])}
			</span>`
		
		profileString += `
			<span class='gauge__label gauge__label--axis' style='right:0;text-align:right'>
				${formatter(scaleDomain[1])}
			</span>`


		// If the attribute is a ratio, then we want to highlight 1, whereever it is on the gauge.
		if (valueName.indexOf('ratio') > -1){
			profileString += `<span class='gauge__label gauge__label--axis gauge__label--center' style='left:${scale(1)}%'>${formatter(1)}</span>`
		}

		return profileString + "</div>";
}

function displayProfile(feature, placeData){
	// Takes a geojson feature and nicely displays selected bits of tract data.
	// TODO: Add Township data
	
	const properties = feature.properties;
	console.log(properties, placeData);
	
	const formatters = {
		ratio: format('.2f'),
		currency: format('$,.2f'),
		currencyRounded: format('$,.0f'),
		percentage: format('.1%')
	}

	const placeName = placeData.address;
	const communityArea = placeData.address.indexOf('Chicago') > -1 ? `<p class='profile__community-area'>${properties.community} community area</p>`
 : "";

	// Load the tract meta data
	document.getElementById('profile__meta').innerHTML = `
		<h2 class='profile__address'>${placeName}</h2>
		${communityArea}
		<h3 class='profile__sub-label profile__sub-label--tract'>${properties.NAMELSAD10}</h3>`;
	
	if (window.mobile){
		// if the window width suggests a mobile device, we just want a nice batch of lists for the profile.
		document.getElementById('profile__column--1').innerHTML = `
			<ul class='profile__attributes profile__attributes--tract'>
				<li>
					<strong>Median home value ratio (after any appeals):</strong>
					${formatters.ratio(properties.ratio1)}
				</li>
				<li>
					<strong>Assessed value:</strong>
					${formatters.currencyRounded(properties.value)}			
				</li>
				<li>
					<strong>Home value: </strong>
					${formatters.currency(properties.av1)}
				</li>
			</ul>`;	

		// Column 2
		document.getElementById('profile__column--2').innerHTML = `
			<ul class='profile__attributes profile__attributes--tract'>
				<li>
					<strong>Percentage of assessment appeals: </strong>
					${formatters.percentage(properties.appeal_fla)}
				</li>
				<li>
					<strong>Taxes: </strong>
					${formatters.currencyRounded(properties.taxes)}
				</li>
				<li>
					<strong>Effective overall tax rate: </strong>
					${formatters.percentage(properties.erate)}
				</li>
			</ul>`;

		// Column 3
		document.getElementById('profile__column--3').innerHTML = `
			<ul class='profile__attributes profile__attributes--tract'>
				<li>
					<strong>Median household income: </strong>
					${formatters.currencyRounded(properties.medhinc)}
				</li>
				<li>
					<strong>Percentage white, not hispanic: </strong>
					${formatters.percentage(properties.white)}
				</li>
			</ul>`;
	} else {
		// If the window width suggests a tablet or greater, then we should do gauges.
		// Column 1
		document.getElementById('profile__column--1').innerHTML = `
			<ul class='profile__attributes profile__attributes--tract'>
				<li>
					<strong>Median home value ratio (after any appeals):</strong>
					${addGauge(properties.ratio1,formatters.ratio, window.gaugeratio1, "ratio1")}
				</li>
				<li>
					<strong>Assessed value:</strong>
					${addGauge(properties.value,formatters.currencyRounded, window.gaugevalue, "value")}			
				</li>
				<li>
					<strong>Home value: </strong>
					${addGauge(properties.av1, formatters.currency, window.gaugeav1, "av1")}			
				</li>
			</ul>`;	
		
		// Column 2
		document.getElementById('profile__column--2').innerHTML = `
			<ul class='profile__attributes profile__attributes--tract'>
				<li>
					<strong>Percentage of assessment appeals: </strong>
					${addGauge(properties.appeal_fla, formatters.percentage, window.gaugeappeal_fla, "appeal_fla")}			
				</li>
				<li>
					<strong>Taxes: </strong>
					${addGauge(properties.taxes,formatters.currencyRounded, window.gaugetaxes, "taxes")}			
				</li>
				<li>
					<strong>Effective overall tax rate: </strong>
					${addGauge(properties.erate,formatters.percentage, window.gaugeerate, "erate")}			
				</li>
			</ul>`;

		// Column 3
		document.getElementById('profile__column--3').innerHTML = `
			<ul class='profile__attributes profile__attributes--tract'>
				<li>
					<strong>Median household income: </strong>
					${addGauge(properties.medhinc,formatters.currencyRounded, window.gaugemedhinc, "medhinc")}			
				</li>
				<li>
					<strong>Percentage white, not hispanic: </strong>
					${addGauge(properties.white,formatters.percentage, window.gaugewhite, "white")}			
				</li>
			</ul>`;

		// center the labels
		const gaugeLabels = document.querySelectorAll('.gauge__label--center');
		for (var gaugeLabel of gaugeLabels){
			const width = gaugeLabel.getBoundingClientRect().width
			gaugeLabel.style.marginLeft = `${width * -0.5}px`;
		}
	}
}


module.exports = displayProfile;