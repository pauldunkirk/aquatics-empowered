// using node-googleplaces to tighten syntax of API call: https://github.com/andrewcham/node-googleplaces
// see Google Places API https://developers.google.com/places/web-service/details
// this page ultimately gets and sends array of photos of a place to the info-window of map:
// using place_id from clicked pool (info in database), request "photo references" from Google Place "Details" API
// then use "photo references" to request "photo URLs" from Google Place "Photos" API
const express = require('express');
const router = express.Router();

const GooglePlaces = require('node-googleplaces');
const places = new GooglePlaces(process.env.KEY);


router.get('/:place_id', (req, pics_res) => {
    places.details({placeid: req.params.place_id}).then( details_res => {
        let detailsObj = JSON.parse(details_res.text);
        let photoReferencesArray = detailsObj.result.photos;
        console.log('detailsObj', detailsObj.result);

        let photoParamsArray = [];

        for (var i = 0; i < photoReferencesArray.length; i++) {
            photoParamsArray.push({
                photoreference: photoReferencesArray[i].photo_reference,
                maxheight: 500,
                maxwidth: 500
            });
        }
				console.log('photoParamsArray', photoParamsArray);

        //https://stackoverflow.com/questions/24660096/correct-way-to-write-loops-for-promise
        var photoUrlsArray = [];
        function getGooglePhotos(photoParamsArray) {
            return photoParamsArray.reduce(function(promise, photoParam) {
                return promise.then(function() {
                    return places.photo(photoParam).then(function(response) {
                        let poolPhotoURL = response.redirects[0]
                        console.log(poolPhotoURL);
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
