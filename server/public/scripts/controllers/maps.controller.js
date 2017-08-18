app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650];

  vm.markerList = [];
  vm.mapCenter = defaultCenter; //Minneapolis coords

  NgMap.getMap().then( map => {
    vm.map = map; //to access gMaps API features
    vm.distance = google.maps.geometry.spherical.computeDistanceBetween;
    console.log('map', map);
    console.log('markers', map.markers);
    // vm.mapCenter = new google.maps.LatLng(vm.mapCenter[0], vm.mapCenter[1])
    getPools(); //run $http request to server
  });
  vm.clicked = url => window.open(url); //open website in new tab

  vm.showDetail = (e, pool) => {
    vm.pool = pool; //set the pool that infoWindow will display on click
    vm.map.showInfoWindow('pool-iw', pool.id);
  };

  vm.reset = () => {
    vm.addr = undefined;
    vm.radius = undefined;
    vm.mapCenter = defaultCenter;
    setMarkerVis();
  };


  const getPools = () => {
    $http.get('/poolList/')
    .then( res => {
      vm.markerList = createMarkerList(res.data);
      vm.pool = vm.markerList[0]; //initialize for infoWindow
    },
      res => console.log('GET pools - error:', res)
    );
  };

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

  vm.poolSearch = () => {
    if (vm.addr && vm.map) {
      //determine and set new map center coords
      GeoCoder.geocode({address: vm.addr})
      .then( (results, status) => {
        let coords = results[0].geometry.location;
        vm.mapCenter = [coords.lat(), coords.lng()];
        setMarkerVis(vm.radius);
      });
    } else {
      //default to large distance for blank field
      setMarkerVis(vm.radius);
    }
  };

  const setMarkerVis = radius => {
    for (key in vm.map.markers) {
      let dist =
        vm.distance(vm.map.markers[key].position, vm.map.center) / 1609.3445;
      let inRangeBool = dist < radius;
      vm.map.markers[key].setVisible(inRangeBool || !radius); //make visible if no set radius
    }
  };

  // markers.reduce(function (prev, curr) {
  //
  //   var cpos = google.maps.geometry.spherical.computeDistanceBetween(location.position, curr.position);
  //   var ppos = google.maps.geometry.spherical.computeDistanceBetween(location.position, prev.position);
  //
  //   return cpos < ppos ? curr : prev;
  //
  // }).position;

}]);
