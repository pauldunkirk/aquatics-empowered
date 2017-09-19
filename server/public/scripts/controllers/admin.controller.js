app.controller('AdminController', ['$http', function($http) {
  const vm = this;
  const api = 'https://maps.googleapis.com/maps/api/';
  const geoBase = api + 'geocode/json?address=';
  const placesBase = api + 'place/nearbysearch/json?query=';
  const textBase = api + 'place/textsearch/json?query=';
  const radarBase = api + 'place/radarsearch/json?location=';
  const cityCoordsUrl = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
  const apiKeyEnd = '&key=AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o';
  const gPlaces = new google.maps.places.PlacesService(document.createElement('div'));

  vm.citiesLeft = [0];
  vm.geocodesLeft = 0;
  vm.errorCount = 0;
  getFacilities();


  vm.findPlaceIds = (num=1) => {
    $http.get(cityCoordsUrl).then( res => {
      pulse(searchCity, res.data, vm.citiesLeft, 1000-num);
    });
  }

  function pulse(queryFn, list, remaining, index=0) {
    remaining[0] = list.length - index;
    if (index < list.length) {
      setTimeout( () => {
        queryFn(list[index++]);
        pulse(queryFn, list, remaining, index);
      }, 180);
    }
  }

  function searchCity(cityCoords) {
    //coordinates of city to search
    const location = new google.maps.LatLng(
      cityCoords.latitude, cityCoords.longitude);
    const request = {
      radius: 50000,
      keyword: vm.keywords,
      location: location
    }

    gPlaces.radarSearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(status);
        return;
      }
      const facilities = results.map( pool => (
        { coords: [pool.geometry.location.lat(), pool.geometry.location.lng()],
          google_place_id: pool.place_id }
      ) )
      for (const facility of facilities) addFacility(facility);
      }
    );
  };

  // const placesSearch = (place) => {
  //   let url = placesBase +  + apiKeyEnd;
  // }
  // function searchPl() {
    // const url = textBase + 'public+swimming+pools+near+55407' + apiKeyEnd;
    // console.log('url', url);
    // $http( {
    //   method: 'GET',
    //   url,
    // } ).then( res => console.log('results', res));
  // }

  // setTimeout( () => searchPl(), 3000);

  function getFacilities() {
    $http.get('/facilities/')
    .then( res => vm.allPools = res.data,
           err => console.log('GET pools - error:', err)
    );
  };

  vm.convert = listType => {
    switch (listType) {
      case "google":
          googleFn(vm.text);
        break;
      case "mapmuse":
          console.log('mapMuse');
          mapMuse(vm.text);
        break;
      default:
    }
  }

  //choose 'paste values only' when pasting to spreadsheet
  const googleFn = text => {
    let arr = text.split('\n'); //create array element for each line of text
    arr = arr.filter( entry =>  /\S/.test(entry)); //remove empty lines
    arr = arr.map( val => val.trim()); //remove leading/trailing whitespace
    arr = arr.filter( entry =>  !(/^Reopens/.test(entry))); //remove empty lines
    arr = arr.filter( entry =>  !(/^Opens/.test(entry))); //remove empty lines
    arr = arr.filter( entry =>  !(/^Closing/.test(entry))); //remove empty lines
    arr = arr.filter( entry =>  !(/^\d(.\d)?$/.test(entry))); //remove rating line
    arr = arr.filter( entry =>  !(/ · /.test(entry))); //remove reviews/pool type line

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
    pulsefind(googPools);

    vm.text = JSON.stringify(googPools, undefined, 4);
    console.log('googPools', googPools);

    function pulseFind(list, index=0) {
      if (index < list.length) {
        setTimeout( () => {
          placesSearch(list[index++]);
          pulsePost(list, index);
        }, 1100);
      } else {
        vm.searching = false;
      }
    }
  }


  const mapMuse = text => {
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
  }

  const addFacility = facility => {
    $http({
      method: 'POST',
      url: '/facilities/',
      data: facility
    }).then(
      res => console.log('POST success', res, vm.numAdded++),
      err => console.log("error adding facility: ", facility, err, vm.errorCount++) );
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
        addFacility(facility);
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
