const express = require('express');
const router = express.Router();
// using node-googleplaces to make API requests
// https://github.com/andrewcham/node-googleplaces
const GooglePlaces = require('node-googleplaces');
// will need to setup KEY as environment variable within production environment using Google API key
const places = new GooglePlaces(process.env.KEY);

// ********************************************************************
// TEST ROUTE '/photos' -- can hit on the frontend if you want to see what these requests return, otherwise can be removed
// router.get('/', (req, res) => {
	// params used for queries to Google Places API
	// API key is included in the params when 'new GooglePlaces(process.env.KEY)' is instantiated
	// See documentation for various types of Google Places API requests for what parameters are required for each
// 	const params = {
// 		location: '49.250964,-123.102192',
// 		radius: 5000
// 	};
// 	places.nearbySearch(params).then( res => {
// 		console.log('nearbySearch results', res.body);
// 	}, err => {
// 		console.log('nearbySearch error', err);
// 	});
// 	res.sendStatus(200);
// });
//******************************************************************************


// @argument place_id used for making a place details request
router.get('/:place_id', (req, res) => {
	// https://developers.google.com/places/web-service/details
	// required params per documentation: Either placeid or reference (you must supply one of these, but not both)
	let detailsParams = {
		placeid: req.params.place_id
	}
	// make place details request using the place_id from the request
	places.details(detailsParams).then( details_res => {
		// response from details request is JSON, need to parse it into a JS object
		let detailsObj = JSON.parse(details_res.text);
		// console.log('detailsObj', detailsObj);
		// pull photo data out of the response information
		let photoReferencesArray = detailsObj.result.photos;
		// console.log('photoReferencesArray', photoReferencesArray);
//Dan's
		// for (var i = 0; i < detailsObj.photos.length; i++) {
		// 	photoReferencesArray.push(detailsObj.photos[i].photo_reference);
		// }

// THIS not working
// var eachPhotoReference;
// 				for (var i = 0; i < photoReferencesArray.length; i++) {
// 					eachPhotoReference = photoReferencesArray[i].photo_reference;);
// 					let photoParams = {
// 					photoreference: eachPhotoReference,
// 					maxheight: 400,
// 					maxwidth: 400
// };


		let firstPhoto = photoReferencesArray[0].photo_reference;
		console.log('first Photo', firstPhoto);
		let photoParams = {
			photoreference: firstPhoto,
			maxheight: 400,
			maxwidth: 400
		};
		console.log('photo params', photoParams);
		// https://developers.google.com/places/web-service/photos
		places.photo(photoParams).then( photos_res => {
			// console.log('photos response', photos_res);
			res.send(photos_res.redirects);
		}, err => {
			// console.log('place photos request error', err);
			res.sendStatus(500);
		});

	}, err => {
		// console.log('place details request error', err);
		res.sendStatus(500);
	});

});

module.exports = router;
