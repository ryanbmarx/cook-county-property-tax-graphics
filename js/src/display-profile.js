const pym = require('pym.js');
import {format} from 'd3';

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
		if (valueName.indexOf('ratio') > -1){
			profileString += `<div class='gauge__labels'>
				<span class='gauge__label gauge__label--axis'>
					-${formatter(1 - scaleDomain[0])}
				</span>`
			profileString += `<span class='gauge__label gauge__label--axis' style='text-align:center;'>Evenly valued <br /><strong>All tracts</strong></span>`;
			profileString += `
				<span class='gauge__label gauge__label--axis' style='right:0;text-align:right'>
					+${formatter(scaleDomain[1] - 1)}
				</span></div>`
		} else {
			profileString += `<div class='gauge__labels'>
				<span class='gauge__label gauge__label--axis'>
					${formatter(scaleDomain[0])}
				</span>`
			profileString += `<span class='gauge__label gauge__label--axis' style='text-align:center'><strong>All tracts</strong></span>`;
			profileString += `
				<span class='gauge__label gauge__label--axis' style='text-align:right'>
					${formatter(scaleDomain[1])}
				</span></div>`
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

	const 	assessedTenPercent = properties.value * 0.1;
	let	overUnder, overUnderClass;
	if (properties.ratio1 > 1){
		overUnder = `overvalued by ${formatters.percentage(properties.ratio1 - 1)}`;
		overUnderClass = "overvalued";
	} else if (properties.ratio1 < 1){ 
		overUnder = `undervalued by ${formatters.percentage(1 - properties.ratio1)}`;
		overUnderClass = "undervalued";
	} else {
		overUnder = "properly valued";
		overUnderClass = "even";
	}
	
	document.getElementById('tract').innerHTML = properties.NAMELSAD10.toLowerCase();
	document.getElementById('over-under').innerHTML = overUnder;
	// document.getElementById('over-under').classList = overUnderClass.toLowerCase();

	// Add the main ratio gauge chart
	document.getElementById('ratio-chart').innerHTML = addGauge(properties.ratio1, formatters.percentage, window.gaugeratio1, "ratio1");


		// Add the gauges for the two charts.

		document.getElementById('appealed').innerHTML = addGauge(properties.appeal_fla, formatters.percentage, window.gaugeappeal_fla, "appeal_fla");
		document.getElementById('appealed-sentence').innerHTML = formatters.percentage(properties.appeal_fla);

		document.getElementById('tax-rate').innerHTML = addGauge(properties.erate,formatters.percentage, window.gaugeerate, "erate");
		document.getElementById('tax-rate-sentence').innerHTML = formatters.percentage(properties.erate);

		// Add the list of auxilliary data points
	
		document.querySelector('.profile__column--numbers').innerHTML = `
			<p><strong>For the ${formatters.integer(properties.N)} homes sold in this tract:</strong></p>
			<ul class='profile__attributes profile__attributes--numbers'>
				<li class='attribute'>
					Median home sales price:
					${formatters.currencyRounded(properties.value)}			
				</li>
				<li class='attribute'>
					Median annual property tax:
					${formatters.currencyRounded(properties.taxes)}			
				</li>
				</ul>
				<p><strong>According to the 2010 census:</strong></p>
				<ul class='profile__attributes profile__attributes--numbers'>
				<li class='attribute'>
					Median household income in this tract:
					${formatters.currencyRounded(properties.medhinc)}			
				</li>
				<li class='attribute'>
					Percentage of tract residents who were non-Hispanic white:
					${formatters.percentage(properties.white)}			
				</li>
			</ul>`;
			
	// center the labels
	const gaugeLabels = document.querySelectorAll('.gauge__label--center');
	for (const i=0; i<gaugeLabels.length; i++){
		let 	gaugeLabel = gaugeLabels[i],
				width = gaugeLabel.getBoundingClientRect().width
		gaugeLabel.setAttribute('style', `margin-left:${width * -0.5}px`);
	}
	// Now open the profile by using our css class
	const profile = document.querySelector('.profile');
	const profileClassList = profile.getAttribute('class');
	profile.setAttribute('class', 'profile ' + 'profile--visible');
	window.pymChild.sendHeight();

}


module.exports = displayProfile;