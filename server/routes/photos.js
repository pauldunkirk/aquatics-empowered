const express = require('express');
const router = express.Router();
// https://github.com/andrewcham/node-googleplaces
const GooglePlaces = require('node-googleplaces');
const places = new GooglePlaces(process.env.KEY);

// https://developers.google.com/places/web-service/details
router.get('/:place_id', (req, pics_res) => {

    places.details({placeid: req.params.place_id}).then( details_res => {
        let detailsObj = JSON.parse(details_res.text);
        let photoReferencesArray = detailsObj.result.photos;
        console.log('photoReferencesArray', photoReferencesArray);

        let photoParamsArray = [];

        for (var i = 0; i < photoReferencesArray.length; i++) {
            photoParamsArray.push({
                photoreference: photoReferencesArray[i].photo_reference,
                maxheight: 200,
                maxwidth: 200
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
