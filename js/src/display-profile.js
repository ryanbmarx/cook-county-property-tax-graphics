import {format} from 'd3';


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
			${formatters.ratio(properties.ratio)}
			<img src='img/ratio.svg' />
		</dd>
		<dt>Median home value ratio after any appeals</dt>
		<dd>
			<img src='img/ratio1.svg' />
			${formatters.ratio(properties.ratio1)}
		</dd>
		<dt>Assessed value:</dt>
		<dd>
			${formatters.currencyRounded(properties.value)}
			<img src='img/home-price.svg' />
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
}


module.exports = displayProfile;