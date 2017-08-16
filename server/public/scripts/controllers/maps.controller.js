app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  vm.markerList = [];
  vm.mapCenter = [44.9778, -93.2650]; //Minneapolis coords

  const getPools = () => {
    $http.get('/poolList/')
    .then( res => {
      vm.markerList = createMarkerList(res.data);
      vm.pool = vm.markerList[0]; //initialize for infoWindow
    },
      res => console.log('GET pools - error:', res)
    );
  }

  getPools(); //initial httm request to server

  const createMarkerList = poolArray => (
    poolArray.map( pool => (
      { id: pool.id,
        position: [pool.lat, pool.lng],
        title: pool.name,
        website: pool.url,
        street_address: pool.street_address,
        city: pool.city,
        state: pool.state,
        zip: pool.zip,
        visible: true }
    ) )
  );

  vm.searchLoc = (search) => {
    if (search.address && vm.map) {   //set new map center coords
      GeoCoder.geocode({address: search.address}).then( (results, status) => {
         vm.mapCenter = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
         console.log('new center', vm.mapCenter);
         hideMarkers(search.radius || 5000);
      });
    } else {
      hideMarkers(search.radius || 5000); //default to large distance for blank field
    }
  }

  const hideMarkers = (radius) => {
    for (var i = 0; i < vm.markerList.length; i++) {
      let inRangeBool = getDistance(vm.markerList[i].position, vm.mapCenter) < radius;
      vm.markerList[i].visible = inRangeBool;
    }
  }

  const getDistance = (c1, c2) => {  //between two lat/lng coordnate arrays
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
  }

  vm.showDetail = (e, pool) => {
    vm.pool = pool; //set the pool that infoWindow will display on click
    vm.map.showInfoWindow('pool-iw', pool.id);
  }

  vm.clicked = url => window.open(url); //open website in new tab

  NgMap.getMap().then( map => {
    vm.map = map; //to access gMaps API features
    console.log('map', map);
    console.log('markers', map.markers);
    // console.log('shapes', map.shapes);
  });

}]);
