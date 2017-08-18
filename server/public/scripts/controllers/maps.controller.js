app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650]; //Minneapolis coords

  vm.markerList = [];
  vm.mapCenter = defaultCenter;

  NgMap.getMap().then( map => {
    vm.map = map; //to access gMaps API features
    vm.distance = google.maps.geometry.spherical.computeDistanceBetween;
    console.log('map', map);
    console.log('markers', map.markers);
    // TODO: set map center to location of user (determined with from browser query)
    getPools(); //run $http request to server for nearby pools
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
      vm.allPools = res.data;
      vm.markerList = createMarkerList(vm.allPools);
      vm.pool = vm.markerList[0]; //initialize for infoWindow
    },
      res => console.log('GET pools - error:', res)
    );
  };

  const createMarkerList = poolArray => (
    //TODO: only do this for the 40 or so markers nearest to vm.map.center
    poolArray.map( pool => (
      { id: pool.id,
        position: [pool.lat, pool.lng],
        title: pool.name,
        website: pool.url,
        street_address: pool.street_address,
        city: pool.city,
        proximityRank: null,
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
        //TODO: run createMarkerList(vm.allPools) for new proximal marker set
        setMarkerVis(vm.radius);
      });
    } else {
      setMarkerVis(vm.radius);
    }
  };

  const setMarkerVis = radius => {
    for (key in vm.map.markers) {
      console.log('marker', vm.map.markers[key]);
      let dist =
        vm.distance(vm.map.markers[key].position, vm.map.center) / 1609.3445;
      let inRangeBool = dist < radius;
      vm.map.markers[key].setVisible(inRangeBool || !radius);
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
