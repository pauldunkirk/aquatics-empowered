app.controller('AdminController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
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

  const mapMuse = (text) => {
    let arr = text.split('\n');
    arr = arr.filter( entry =>  /\S/.test(entry));
    console.log('arr', arr);
    musePools = [];
    for (var i = 0; i < arr.length-3; i=i+3) {
      let state = arr[i+2].match(/[A-Z][A-Z]$/g)[0];
      let noState = arr[i+2].slice(0, arr[i+2].length-3);
      let city = noState.match(/(?!, )(\w *)+(?=$)/g)[0];
      let street_address = noState.match(/.+(?=(, (\w *)+(?=$)))/g)[0];
      musePools.push( {
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

  vm.addFacilities = () => {
    $http({
      method: 'POST',
      url: '/facilities/many',
      data: JSON.parse(vm.text),
      headers: {}
    }).then(
      res => console.log('POST success', res),
      err => console.log("error adding facility: ", err) );
  };



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
