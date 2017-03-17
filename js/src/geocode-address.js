// 1060 West Addison, Chicago, IL

import {json} from 'd3';

let userInputLocation = {};

function geocodeAddress (address){
	// TurfJS REQUIRES [<long>, <lat>] pairings (vs. reversing the coordinates). 
	// Make sure to use Turf's geoJson constructors to map this stuff.

	console.log('geocoding', address);
	const requestUrl = `https://qyf1ag22mj.execute-api.us-east-1.amazonaws.com/production/locations?q=${encodeURI(address)}&userLocation=41.8337329,-87.7321555`
	

	json(requestUrl, function(data){
		console.log(data);
		userInputLocation = {
			address: data.resourceSets[0].resources[0].name,
			coordinates:[
				data.resourceSets[0].resources[0].geocodePoints[0].coordinates[1],
				data.resourceSets[0].resources[0].geocodePoints[0].coordinates[0]
			]
		}
		// console.log(data.resourceSets[0].resources[0], userInputLocation);

		// THESE ARE TEST POINTS to keep the rig running
		const merchandiseMart = [-87.634534, 41.888020];
		const tribuneTower = [-87.623900, 41.890598];
		const wrigleyField = [-87.655889, 41.947783];


		console.log(userInputLocation)
		return userInputLocation;
	})
}
module.exports = geocodeAddress;