var fs = require('fs');
var _ = require ('underscore');


// var csv is the CSV file with headers, 
// from http://techslides.com/convert-csv-to-json-in-javascript
// returns an array of JS objects

function csvJSON(csv){

  var lines=csv.split("\n");
  var result = [];

  var headers=lines[0].split(",");
  headers[headers.length-1] = headers[headers.length-1].replace('\r', '');
  
  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);
  }
  
  return result; //JavaScript object
  // return JSON.stringify(result); //JSON
}


// const urlDataToAppend = "https://docs.google.com/spreadsheets/d/1uKk1FgYL3ES94EPbMOYHLQCHQkBRFZZeHoBEki_DZX0/pub?gid=2059178675&single=true&output=csv"


fs.readFile(`./data/voting - alldata.csv`, 'utf8', (err, data) => {
	
	// This is our csv we want to insert into the geojson
	const dataToAppend = csvJSON(data);
	var keys = Object.keys(dataToAppend['0']);

	fs.readFile(`./data/midwest-counties.geojson`, 'utf8', (err, data) => {
		if (err) throw err;

		// this is the geojson
		const jsonData = JSON.parse(data);

		// For each feature in the geojson (state, county, etc.), do this ...
		jsonData.features.forEach((feature, feature_idx) => {
			// Filter the list of data to just the matching fips
			var filteredDataToAppend = _.filter(dataToAppend, function(feature_obj){
				return feature_obj.fips == feature.properties.GEOID;
			})[0];

			// Loop through the keys and add the key/value pair
			// to the properties object inside each GEOJSON feature
			keys.forEach((val, idx)=>{
				feature.properties[val] = filteredDataToAppend[val];
			})
		})

		fs.writeFile(`./data/midwest-counties-with-centroid.geojson`, JSON.stringify(jsonData), (err) => {
			
			if(err) {
				return console.log(err);
			} else {
				return console.log('done writing file');
			}
		}); 
	});
})

