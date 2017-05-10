var pym = require('pym.js');
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
	

	let profileString = `
		<div class='gauge'>
			<svg class='gauge__triangle' style='left:${scale(value)}%' viewBox="0 0 25 25" ><use xlink:href="#triangle" /></svg>
			<svg class='gauge__chart' preserveAspectRatio="none" viewBox="0 0 280 15" ><use xlink:href="#${valueName}" /></svg>`;			

		// Now add the min and max. I would do it with a domain.forEach, but there only are two and each 
		// needs a slightly different treatment, so manual it is.
	
		profileString += `
			<span class='gauge__label gauge__label--axis' style='left:0'>
				${formatter(scaleDomain[0])}
			</span>`
		profileString += `<span class='gauge__label gauge__label--axis' style='left:50%;margin-left: -25px;'>All tracts</span>`;
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
	
	const formatters = {
		ratio: format('.2f'),
		currency: format('$,.2f'),
		currencyRounded: format('$,.0f'),
		percentage: format('.1%'),
		integer: format(',')
	}

	const placeName = placeData.address;
	const communityArea = placeData.address.indexOf('Chicago') > -1 ? `<p class='profile__community-area'>${properties.community} community area</p>`
 : "";

 	// Make the input address the full and proper address
 	document.getElementById("search-address").value = placeData.address;

	// Load the tract meta data

	const 	assessedTenPercent = properties.value * 0.1,
			overUnder = properties.av1 > assessedTenPercent ? 'overvalued' : 'undervalued';
	
	document.getElementById('tract').innerHTML = properties.NAMELSAD10.toLowerCase();
	document.getElementById('market').innerHTML = formatters.currencyRounded(properties.value);
	document.getElementById('assessed-ten-per').innerHTML = formatters.currencyRounded(assessedTenPercent);
	document.getElementById('assessed-actual').innerHTML = `<span>${formatters.currencyRounded(properties.av1)}</span>`;
	document.querySelector('#assessed-actual span').classList = overUnder.toLowerCase();
	document.getElementById('over-under').innerHTML = overUnder;
	document.getElementById('over-under').classList = overUnder.toLowerCase();


	if (window.mobile){

			document.querySelector('.profile__column--numbers').innerHTML = `
			<ul class='profile__attributes profile__attributes--numbers'>
				<li class='attribute'>
					<strong>Percentage of assessments appealed: </strong>
					${formatters.percentage(properties.appeal_fla)}			
				</li>
				<li class='attribute'>
					<strong>Effective tax rate for a typical home: </strong>
					${formatters.percentage(properties.erate)}			
				</li>
				<li class='attribute'>
					<strong>Median annual property tax: </strong>
					${formatters.currencyRounded(properties.taxes)}			
				</li>
				<li class='attribute'>
					<strong>Median household income: </strong>
					${formatters.currencyRounded(properties.medhinc)}			
				</li>
				<li class='attribute'>
					<strong>Percentage of tract population that is non-Hispanic white: </strong>
					${formatters.percentage(properties.white)}			
				</li>
				<li class='attribute'>
					<strong>Number of homes sold in this tract: </strong>
					${properties.N}
				</li>
			</ul>`;
	} else {
		// Add the gauges for the two charts.

		document.getElementById('appealed').innerHTML = addGauge(properties.appeal_fla, formatters.percentage, window.gaugeappeal_fla, "appeal_fla");
		document.getElementById('appealed-sentence').innerHTML = formatters.percentage(properties.appeal_fla);

		document.getElementById('tax-rate').innerHTML = addGauge(properties.erate,formatters.percentage, window.gaugeerate, "erate");
		document.getElementById('tax-rate-sentence').innerHTML = formatters.percentage(properties.erate);

		// Add the list of auxilliary data points
	
		document.querySelector('.profile__column--numbers').innerHTML = `
			<ul class='profile__attributes profile__attributes--numbers'>
				<li class='attribute'>
					<strong>Median annual property tax: </strong>
					${formatters.currencyRounded(properties.taxes)}			
				</li>
				<li class='attribute'>
					<strong>Median household income: </strong>
					${formatters.currencyRounded(properties.medhinc)}			
				</li>
				<li class='attribute'>
					<strong>Percentage of tract population that is non-Hispanic white: </strong>
					${formatters.percentage(properties.white)}			
				</li>
				<li class='attribute'>
					<strong>Number of homes sold in this tract: </strong>
					${properties.N}
				</li>
			</ul>`;
	}
	// center the labels
	const gaugeLabels = document.querySelectorAll('.gauge__label--center');
	for (var gaugeLabel of gaugeLabels){
		const width = gaugeLabel.getBoundingClientRect().width
		gaugeLabel.style.marginLeft = `${width * -0.5}px`;
	}
	// Now open the profile by using our css class
	const profile = document.querySelector('.profile');
	profile.classList.add('profile--visible');
}


module.exports = displayProfile;