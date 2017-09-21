app.controller('AdminController', ['$http', function($http) {
  const vm = this;
  const api = 'https://maps.googleapis.com/maps/api/';
  const geoBase = api + 'geocode/json?address=';
  const placesBase = api + 'place/nearbysearch/json?query=';
  const textBase = api + 'place/textsearch/json?query=';
  const radarBase = api + 'place/radarsearch/json?location=';
  const apiKeyEnd = '&key=AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o';
  const gPlacesAPI = new google.maps.places.PlacesService(document.createElement('div'));

  //a JSON containing the 1000 biggest US cities and their coordinates
  vm.cityCoordsUrl = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
  vm.citiesLeft = [0]; //array to allow passing by reference to pulse()
  vm.placesLeft = [0];
  vm.geocodesLeft = 0;
  vm.errorCount = 0;
  vm.gPlaceIdList = [];
  getFacilities();

  //methods making heavy use of google places
  vm.gPlaces = {
    findIds(num=1) {
      $http.get(vm.cityCoordsUrl).then(
        res => pulse(searchCity, res.data, vm.citiesLeft, 180, 1000-num),
        err => console.log('could not find cities JSON', err)
      )
    },
    getIdList() {
      $http.get('/placeIds').then(
        res => vm.gPlaceIdList = res.data.map( obj => obj.place_id ),
        err => console.log('error accessing place id table', err)
      )
    },
    //takes a list of google Ids, gets relevant info, and adds to db
    getInfoFromIds(idList) {
      idList = idList.filter( n => n );
      return pulse(vm.gPlaces.getDetails, idList, vm.placesLeft, 1100)
    },

    getDetails(placeId) {
      console.log('THERE SHOULD BE SOMETHING LOGGING HERE', placeId);
      gPlacesAPI.getDetails( {placeId}, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log('place', place);
          const facility = vm.gPlaces.parseDetails(place);
          addFacilityToDb(facility);
        } else {
          console.log('gPlacesAPI error', status);
        }
      });
    },
    //put google place details into format for our DB
    parseDetails(pResult) {
      let adrCmps = {}; //format address components of gmaps for usability
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
        google_place_id: pResult.place_id,
        //ALL of the google details are kept in this JSON
        google_places_data: JSON.stringify(pResult, undefined, 4)
      }
    }
  }

  function pulse(queryFn, list, remaining, delay, index=0) {
    remaining[0] = list.length - index;
    if (index < list.length) {
      setTimeout( () => {
        queryFn(list[index++]);
        pulse(queryFn, list, remaining, delay, index);
      }, delay);
    }
  }

  function searchCity(cityCoords) {
    const location = new google.maps.LatLng(
      cityCoords.latitude, cityCoords.longitude);
    const request = {
      radius: 50000,
      keyword: vm.keywords,
      location: location
    }

    gPlacesAPI.radarSearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(status);
        return;
      }
      const facilities = results.map( pool => (
        { coords: [pool.geometry.location.lat(), pool.geometry.location.lng()],
          place_id: pool.place_id }
      ) )
      for (const facility of facilities) addPlaceIdToDb(facility);
      }
    );
  };

  function getFacilities() {
    $http.get('/facilities/')
    .then( res => vm.allPools = res.data,
           err => console.log('GET pools - error:', err)
    );
  };

  //methods for parcing datasets from different sources into usable JSON
  vm.toJson = {
    mapMuse(text) {
      let arr = text.split('\n'); //create array element for each line of text
      arr = arr.filter( entry =>  /\S/.test(entry)); //remove empty lines
      arr = arr.map( val => val.trim()); //remove leading/trailing whitespace
      const musePools = [];
      for (var i = 0; i < arr.length-3; i=i+3) {
        //two capital letters followed by end of string = state
        let state = arr[i+2].match(/[A-Z][A-Z]$/g)[0];
        //remove the last 3 chars (state and preceding space)
        let noState = arr[i+2].slice(0, arr[i+2].length-3);
        //one or more words (optionally followed by a space) between ", " and end of string = city
        let city = noState.match(/(?!, )(\w *)+(?=$)/g)[0];
        //everything before the above ", " will be the street address
        let street_address = noState.match(/.+(?=(, (\w *)+(?=$)))/g)[0];
        musePools.push( {
          source: 'mapmuse',
          name: arr[i],
          pool_type: arr[i+1],
          street_address,
          city,
          state,
        } )
      }
      vm.text = JSON.stringify(musePools, undefined, 4);
      console.log('musePools', musePools);
    },
    //this section is incomplete
    google(text) {
      let arr = text.split('\n'); //create array element for each line of text
      const googPools = [];
      for (var i = 0; i < arr.length-3; i=i+2) {
        let name = arr[i];
        let city = arr[i+1].split(', ')[0];
        let state = arr[i+1].split(', ')[1];
        googPools.push( {
          source: 'google',
          name,
          city,
          state,
        } )
      }
    }
  }

  const addFacilityToDb = facility => {
    $http({
      method: 'POST',
      url: '/facilities/',
      data: facility
    }).then(
      res => console.log('POST success', res, vm.numAdded++),
      err => console.log("error adding facility: ", facility, err, vm.errorCount++) );
  };

  const addPlaceIdToDb = placeId => {
    $http({
      method: 'POST',
      url: '/placeIds/',
      data: placeId
    }).then(
      res => console.log('POST success', res, vm.numAdded++),
      err => console.log("error adding placeId: ", placeId, err, vm.errorCount++) );
  };

  const geoCodeAdd = facility => {
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
          geoCodeAdd(list[index++]);
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
