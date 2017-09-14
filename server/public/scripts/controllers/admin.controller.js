app.controller('AdminController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;

  NgMap.getMap().then( map => {
    //ANYTHING REQUIRING ACCESS TO GOOGLE API GOES IN HERE
    vm.map = map; //to access gMaps API features
    // TODO: set map center to location of user (determined with from browser query)
    // getFacilities(); //run $http request to server for nearby pools
  });

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

  const mapMuse = (text) => {
    let arr = text
    .replace(/, /g, '\n')
    .split('\n');

    // .replace(/ [A-Z][A-Z]$/g, '\n')

    arr = arr.filter( entry =>  /\S/.test(entry));
    console.log('arr', arr);
    let musePools = [];
    for (var i = 0; i < arr.length; i=i+4) {
      let cityState = arr[i+3].split(/ (?=[A-Z][A-Z]$)/g);
      musePools.push( {
        name: arr[i],
        pool_type: arr[i+1],
        street_address: arr[i+2],
        city: cityState[0],
        state: cityState[1]
      } )
    }

    console.log('musePools', musePools);
  }

var address = "San Francisco, CA 94129";

function parseAddress(address) {
    // Make sure the address is a string.
    if (typeof address !== "string") throw "Address is not a string.";

    // Trim the address.
    address = address.trim();

    // Make an object to contain the data.
    var returned = {};

    // Find the comma.
    var comma = address.indexOf(',');

    // Pull out the city.
    returned.city = address.slice(0, comma);

    // Get everything after the city.
    var after = address.substring(comma + 2); // The string after the comma, +2 so that we skip the comma and the space.

    // Find the space.
    var space = after.lastIndexOf(' ');

    // Pull out the state.
    returned.state = after.slice(0, space);

    // Pull out the zip code.
    returned.zip = after.substring(space + 1);

    // Return the data.
    return returned;
}

address = parseAddress(address);

// const googleFn = () => {
//   const regEx =
//
//
//
// }

  // const regEx = /([A-G](\#|b)?(?=((m\s|maj|dim)|(\d\d?)|(add\d)|(sus)|(\s|\n))))/g;
  //   return text.replace(regEx, (match) =>
  //     tonics[(tonics.indexOf(match) + 1) % 12]);

  const addFacility = (facility) => {
    $http({
      method: 'POST',
      url: '/facilities/',
      data: facility,
      headers: {}
    }).then(
      res => console.log('POST success', res),
      err => console.log("error adding facility: ", err) );
  };

  //use this instead of google.maps.geometry.spherical.computeDistance() because of API query limit

  const geoCodeAdd = facility => {
    let addr = facility.street_address + ', ' + facility.city + ' ' + facility.state;
    GeoCoder.geocode({address: addr})
    .then( results => {
      let zipCmp = results[0].address_components.find(
        addrCmp => addrCmp.types[0] == 'postal_code');
      if (zipCmp) {
        let coords = results[0].geometry.location;
        facility.coords = [coords.lat(), coords.lng()];
        facility.zip = zipCmp.long_name;
        facility.google_place_id = results[0].place_id;
        console.log('geocoded facility:', facility);
        addFacility(facility);
      } else {
        console.log('no zip found:', addr, results);
      }
    });
  };

  const convertAndPostJSON = (route, index=0) => {
    const pulsePost = list => {
      if (index < list.length - 1) {
        setTimeout( () => {
          geoCodeAdd(list[index++]);
          pulsePost(list);
        }, 1100);
      }
      console.log(list.length - index, 'facilities remaining');
    };
    $http.get(route)
    .then( res => pulsePost(res.data),
           err => console.error('GET JSON facilities - error:', err)
    );
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
