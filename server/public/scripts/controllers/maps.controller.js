app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650]; //Minneapolis coords

  vm.maxMarkers = 15;
  vm.markerList = [];
  vm.mapCenter = defaultCenter;

  NgMap.getMap().then( map => {
    //ANYTHING REQUIRING ACCESS TO GOOGLE API GOES IN HERE
    vm.map = map; //to access gMaps API features
    console.log('map', map);
    console.log('markers', map.markers);
    // TODO: set map center to location of user (determined with from browser query)
    getFacilities(); //run $http request to server for nearby pools
  });

  vm.logPool = () => console.log('selected pool:', vm.pool);

  vm.clicked = url => window.open(url); //open facility website in new tab
  vm.getIcon = num => 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';

  vm.showDetail = (e, pool) => {
    vm.pool = pool; //set the pool that infoWindow will display on click
    vm.map.showInfoWindow('pool-iw', pool.id);
  };

  vm.reset = () => {
    vm.addr = undefined;
    vm.radius = undefined;
    vm.pool = undefined;
    vm.mapCenter = defaultCenter;
    vm.map.hideInfoWindow('pool-iw');
    vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
  };

  vm.newCenter = () => {
    vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
    vm.map.hideInfoWindow('pool-iw');
    vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
    setMarkerVis(vm.radius);
  };

  const getFacilities = () => {
    $http.get('/facilities/')
    .then( res => {
      vm.allPools = res.data;
      vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
    },
      err => console.log('GET pools - error:', err)
    );
  };

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

  const createMarkerList = (poolArray, maxMarkers, center) => (
    poolArray.map( pool => (
      { id: pool.id,
        position: pool.coords,
        title: pool.name,
        website: pool.url,
        street_address: pool.street_address,
        city: pool.city,
        distance: getDistance(pool.coords, center),
        state: pool.state,
        zip: pool.zip,
        visible: true,
        googleJson: pool.google_places_data,
        reviews: (pool.google_places_data.reviews || []).map(
          review => (review.rating + ' stars:\n' + review.text + ' - ' + review.author_name
        ) )}
    ) )
    .sort( (a, b) => a.distance - b.distance )
    .slice( 0, maxMarkers )
  );

  vm.poolSearch = () => {
    if (vm.addr && vm.map) {
      //determine and set new map center coordsxx
      GeoCoder.geocode({address: vm.addr})
      .then( (results, status) => {
        //Note: results[0]==Google's 'best guess'
        let coords = results[0].geometry.location;
        vm.mapCenter = [coords.lat(), coords.lng()];
        vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
        setMarkerVis(vm.radius);
      });
    } else {
      setMarkerVis(vm.radius);
    }
  };

  const setMarkerVis = radius => {
    for ( let i=0; i < vm.markerList.length; i++) {
      let dist = getDistance(vm.markerList[i].position, vm.mapCenter);
      let inRangeBool = dist < radius;
      vm.markerList[i].visible = inRangeBool || !radius;
    }
  };

  //use this instead of google.maps.geometry.spherical.computeDistance() because of API query limit
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

}]);

//examples of using these tools
// convertAndPostJSON('/bigList/');
