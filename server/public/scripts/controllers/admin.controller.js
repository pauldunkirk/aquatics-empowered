app.controller('AdminController', ['$http', function($http) {
  const vm = this;
  const api = 'https://maps.googleapis.com/maps/api/';
  const geoBase = api + 'geocode/json?address=';
  const placesBase = api + 'place/nearbysearch/json?query=';
  //jakes api key
  const apiKeyEnd = '&key=AIzaSyC9VCo-31GBleDuzdGq5xXRp326ADgLgh8';
  //directly using google places API instead of NgMap because NgMap has no access to the google radar (bulk) search
  //'gPlacesAPI' is instead names 'service' in some google examples. Too generic for our purposes
  const gPlacesAPI = new google.maps.places.PlacesService(document.createElement('div'));

  //a JSON containing the 1000 biggest US cities and their coordinates
  vm.cityCoordsUrl =  'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
  vm.citiesLeft = [0]; //array to allow passing by reference to pulse()
  vm.placesLeft = [0];
  vm.geocodesLeft = 0;
  vm.errorCount = 0;
  vm.gPlaceIdList = [];
  vm.abort = false;
  vm.pulsing = false;
  getFacilities();
  getDbType();

  //methods making heavy use of google places
  //placed into one object for code readability/organization/collapsibility
  vm.gPlaces = {
    findIds(num=1) {
      $http.get(vm.cityCoordsUrl).then(
        res => {
          console.log('cities', res.data);
          pulse(searchCity, res.data, vm.citiesLeft, 1000, 1000-num);
        },
        err => console.log('could not find cities JSON', err)
      )
    },
    getIdList() {
      $http.get('/placeIds').then(
        res => vm.gPlaceIdList = res.data,
        err => console.log('error accessing place id table', err)
      )
    },
    //takes a list of google Ids, gets google info for EACH id, adds to db
    getInfoFromIds(idList) {
      idList = idList.filter( n => n ); //remove empty list items
      //calls vm.gPlaces.getDetails for each iteration/item in idList
      //tallies remaining places in vm.placesLeft[0]
      //waits 1100ms between each iteration
      //starts at position 0 (beginning) of idList
      return pulse(vm.gPlaces.getDetails, idList, vm.placesLeft, 1100, 0)
    },
    //gets the google details of an item with a google places id property
    getDetails(basicPlace) {
      console.log('basicPlace', basicPlace);
      gPlacesAPI.getDetails( {placeId: basicPlace.place_id}, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log('place', place);
          const facility = vm.gPlaces.parseDetails(place, basicPlace.keyword);
          addFacilityToDb(facility);
        } else {
          console.log('gPlacesAPI error', status);
        }
      });
    },
    //put google place details into format for our DB
    parseDetails(pResult, keyword) {
      let adrCmps = {}; //format address components of gmaps for usability
      //this jQuery magic to reformat the result was copied from the internet:
      $.each(pResult.address_components, (k,v1) => $.each(v1.types, (k2, v2) =>
        adrCmps[v2]=v1.short_name)
      );
      const loc = pResult.geometry.location;
      return {
        name: pResult.name,
        street_address: adrCmps.street_number + ' ' + adrCmps.route,
        city: adrCmps.locality,
        state: adrCmps.administrative_area_level_1,
        zip: adrCmps.postal_code,
        phone: pResult.formatted_phone_number,
        image_url: pResult.icon,
        url: pResult.website,
        coords: [loc.lat(), loc.lng()],
        keyword: keyword,
        google_place_id: pResult.place_id,
        //ALL of the google details are kept in this JSON
        google_places_data: JSON.stringify(pResult, undefined, 4)
      }
    }
  }

  function pulse(queryFn, list, remaining, delay, index=0) {
    if((list.length > index) && !vm.abort){
      vm.pulsing = true;
      setTimeout( () => {
        if (vm.abort) {
          console.log('aborting pulse');
          remaining[0] = 0;
          vm.abort = false;
          vm.pulsing = false;
          return;
        }
        //run the function on the data in the current index location of the list
        //increment the index
        queryFn(list[index++]);
        //stores relevant data for items remaining at position zero of array
        //using array to pass by reference to location in memory, so the value at that location is altered.
        //only necessary for displaying amount remaining on DOM
        remaining[0] = list.length - index;
        //recursively calls itself with new incremented index
        pulse(queryFn, list, remaining, delay, index);
      }, delay);
    }
  }

  function searchCity(cityCoords) {
  //create gMaps LatLng object (required for radar search) with city coords
    const location = new google.maps.LatLng(
      cityCoords.latitude, cityCoords.longitude);
    const request = {
      //max radius allowed by google. will top out at 200 nearest results
      radius: 50000,
      //search term
      keyword: vm.keywords,
      //LatLng object from above
      location,
    }
  //params documentation:
    //https://developers.google.com/places/web-service/search#RadarSearchRequests
    //JS example:
    //https://developers.google.com/maps/documentation/javascript/examples/place-radar-search
    //(i do not use service.radarSearch because 'service' is too generic for a real webapp)
    gPlacesAPI.radarSearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error('google places service error:', status);
        return;
      }
      //makes array of objects with these three properties from the google radar results
      const idList = results.map( pool => (
        { coords: [pool.geometry.location.lat(), pool.geometry.location.lng()],
          place_id: pool.place_id,
          keyword: request.keyword}
      ) )
      console.log('idlist', idList);
      //ES6 for loop functionality. look up "for of loop"
      for (const idObject of idList) addPlaceIdToDb(idObject);
    } );
  };

  function getFacilities() {
    $http.get('/facilities/')
    .then( res => { vm.allPools = res.data;},
           err => console.log('GET pools - error:', err)
    );
  };

  function getDbType() {
    $http.get('/local/')
    .then( res => res.data ? vm.dbType = 'LOCAL' : vm.dbType = 'HEROKU' ,
           err => console.log('GET local - error:', err)
    );
  };



  const addFacilityToDb = (facility) => {
    $http({
      method: 'POST',
      url: '/facilities/',
      data: facility
    }).then(
      res => {
        console.log('POST success', res, vm.numAdded++);
      },
      err => console.log("error adding facility: ", facility, err, vm.errorCount++) );
  };

  // removes entries with place Ids that exist in facilities table
  vm.cleanIdList = () => {
    $http({
      method: 'DELETE',
      url: '/placeIds/allDuplicates/',
    }).then(
      res => console.log('DELETE success'),
      err => console.log("error deleting form placeId list: ", err) );
  };

  vm.deleteIdList = () => {
    $http({
      method: 'DELETE',
      url: '/placeIds/all/',
    }).then(
      res => console.log('DELETE success'),
      err => console.log("error deleting form placeId list: ", err) );
  };

  vm.deleteFacility = id => {
    $http({
      method: 'DELETE',
      url: '/facilities/byId/' + id,
    }).then(
      res => {
        console.log('DELETE success')
        removeObjById(vm.allPools, id);

    },
      err => console.log("error deleting form placeId list: ", err) );
  };

  const deleteFromIdList = (placeId) => {
    $http({
      method: 'DELETE',
      url: '/placeIds/byId/' + placeId,
    }).then(
      res => console.log('DELETE success'),
      err => console.log("error deleting form placeId list: ", placeId) );
  };


  const addPlaceIdToDb = placeObject => {
    $http({
      method: 'POST',
      url: '/placeIds/',
      data: placeObject
    }).then(
      res => vm.numAdded++,
      err => console.log("error adding placeObject: ", placeObject, err, vm.errorCount++) );
  };

  const geocodeAdd = facility => {
    const address = facility.street_address + ', ' + facility.city + ', ' + facility.state;
    const url = geoBase + (address).replace(' ', '+') + apiKeyEnd;
    //access google API via url
    $http.get(url).then( res => {
      console.log('geocode res', res);
      if (res.data.status == "OK") {
        const locData = res.data.results[0];
        const zipCmp = locData.address_components.find(
          addrCmp => addrCmp.types[0] == 'postal_code');
        const coords = locData.geometry.location;
        //assign values from GeoCode query
        facility.coords = [coords.lat, coords.lng];
        facility.zip = zipCmp.long_name;
        facility.google_place_id = locData.place_id;
        console.log('geocoded facility:', facility);
        addFacilityToDb(facility);
      } else {
        console.log('no location found:', url, results);
      }
    });
  };

  vm.geocodeAndPost = (jsonString, index=0) => {
    vm.errorCount = 0;
    const json = JSON.parse(jsonString);
    const list = $.map(json, el => el);
    console.log('list', list);
    pulsePost(list);

    function pulsePost(list) {
      if (index < list.length) {
        setTimeout( () => {
          geocodeAdd(list[index++]);
          pulsePost(list);
        }, 1100);
      }
      vm.geocodesLeft = list.length - index;
    };
  };

  //returns a boolean
  vm.validateJson = (text='') => (
    (/^[\],:{}\s]*$/.test(
        text.replace(/\\["\\\/bfnrtu]/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
      )) && text!=''
  )

/***************************ANGULAR SEARCH FILTER ***************************/


  vm.currentPage = 0;
  vm.pageSize = 20;
  vm.filtered = [];
  vm.loading = false;
  vm.sortType = 'id'; // set the default sort type
  vm.sortReverse = true;  // set the default sort order
  vm.show = {
    options: ['Pending', 'Dispatched', 'Completed', 'Declined'],
    statuses: [true, true, true, true],
    text: function () {
      var ret = [];
      var pendBool = (!this.statuses[0] && this.options[0]);
      var dispBool = (!this.statuses[1] && this.options[1]);
      var compBool = (!this.statuses[2] && this.options[2]);
      var decBool = (!this.statuses[3] && this.options[3]);
      if (compBool) { ret.push(compBool); }
      if (decBool) { ret.push(decBool); }
      if (dispBool) { ret.push(dispBool); }
      if (pendBool) { ret.push(pendBool); }
      return ret;
    }
  };
  vm.setSort = column => {
    vm.sortReverse = !vm.sortReverse;
    vm.sortType = column;
  }
  vm.pageCheck = function(numResults) {
    var total = vm.totalPages(numResults);
    if (vm.currentPage >= total || ((vm.currentPage == -1) && total)) {
      vm.currentPage = total -1 ;
    }
  };
  vm.totalPages = function (num) {
    var total = 0;
    if (num) {
      total = parseInt(((num - 1) / vm.pageSize) + 1);
    }
    return total;
  };

}]);

//for bulk posting. not compatable with google geocoding rate limit
// const addFacilities = (facilities) => {
//   $http({
//     method: 'POST',
//     url: '/facilities/many',
//     data: facilities,
//     headers: {}
//   }).then(
//     res => console.log('POST success', res),
//     err => console.log("error adding facility: ", err) );
// };
