// using node-googleplaces to tighten syntax of API call: https://github.com/andrewcham/node-googleplaces
// see Google Places API https://developers.google.com/places/web-service/details
// this page ultimately gets and sends array of photos of a place to the info-window of map:
// using place_id from clicked pool (info in database), request "" from Google Place "Details" API
// then use "photo references" to request "photo URLs" from Google Place "Photos" API
const express = require('express');
const router = express.Router();

const GooglePlaces = require('node-googleplaces');
const places = new GooglePlaces(process.env.KEY);


router.post('/', (req, res) => {
  // we hvae a req.body which would contain the place_id from radar table
    places.details({ placeid: req.params.place_id}).then( details_res => {
        let detailsObj = JSON.parse(details_res.text);
				// console.log('detailsObj', detailsObj);
				console.log('************************************************ detailsObj.result', detailsObj.result);

        console.log('************************************************ detailsObj.result.', detailsObj.result);


        let photoReferencesArray = detailsObj.result.photos;
        // console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& photoReferencesArray', photoReferencesArray);

				//create Params Array for Photo API request for URLs
        let photoParamsArray = [];

        for (var i = 0; i < photoReferencesArray.length; i++) {
            photoParamsArray.push({
                photoreference: photoReferencesArray[i].photo_reference,
                maxheight: 500,
                maxwidth: 500
            });
        }
				console.log('*********************************** photoParamsArray', photoParamsArray);

        //https://stackoverflow.com/questions/24660096/correct-way-to-write-loops-for-promise
        var photoUrlsArray = [];
        function getGooglePhotos(photoParamsArray) {
            return photoParamsArray.reduce(function(promise, photoParam) {
                return promise.then(function() {
                    return places.photo(photoParam).then(function(response) {
                        let poolPhotoURL = response.redirects[0]
                        console.log('*********************************** poolPhotoURL', poolPhotoURL);
                        photoUrlsArray.push(poolPhotoURL);
                    })
                })
            }, Promise.resolve());
        }

        getGooglePhotos(photoParamsArray).then(function() {
            pics_res.send({photoUrlsArray: photoUrlsArray});

        }, err => {
            console.log('place photos request error', err);
            pics_res.sendStatus(500);
        })

    }, err => {
        console.log('place details request error', err);
        details_res.sendStatus(500);
    });
});
module.exports = router;
