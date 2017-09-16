app.controller('AdminController', ['$http', function($http) {
  const vm = this;
  const geoBase = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
  const geoEnd = '&key=AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o';
  vm.geocoding = false;
  vm.remaining = 0;
  getFacilities();


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
    vm.text = JSON.stringify(musePools, undefined, 4);;
    console.log('musePools', musePools);
  }

  // const addFacilities = () => {
  //   $http({
  //     method: 'POST',
  //     url: '/facilities/many',
  //     data: JSON.parse(vm.text),
  //     headers: {}
  //   }).then(
  //     res => console.log('POST success', res),
  //     err => console.log("error adding facility: ", err) );
  // };

  const addFacility = facility => {
    $http({
      method: 'POST',
      url: '/facilities/',
      data: facility,
      headers: {}
    }).then(
      res => console.log('POST success', res),
      err => console.log("error adding facility: ", facility, err) );
  };

  const geoCodeAdd = facility => {
    const address = facility.street_address + ', ' + facility.city + ', ' + facility.state;
    const url = geoBase + (address).replace(' ', '+') + geoEnd;
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

  vm.convertAndPost = (jsonString, index=0) => {
    vm.geocoding = true;
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
      } else {
        vm.geocoding = false;
      }
      vm.remaining = list.length - index;
    };
  };

  const getDistance = (c1, c2) => {
    const _deg2rad = deg => deg * (Math.PI/180);
    let R = 3959; // Radius of the earth in miles
    let dLat = _deg2rad(c2[0]-c1[0]);
    let dLon = _deg2rad(c2[1]-c1[1]);
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
     Math.cos(_deg2rad(c1[0])) * Math.cos(_deg2rad(c2[0])) *
     Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c; // Distance in miles
    return d;
  };
}]);

//examples of using these tools
// convertAndPostJSON('/bigList/');
