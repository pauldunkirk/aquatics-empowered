app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650];
  vm.markerList = [];
  vm.mapCenter = defaultCenter; //Minneapolis coords

  NgMap.getMap().then( map => {
    vm.map = map; //to access gMaps API features
    console.log('map', map);
    console.log('markers', map.markers);
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

  getPools(); //run $http request to server

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
    console.log('poolsearch');
    if (vm.addr && vm.map) {
      //determine and set new map center coords
      GeoCoder.geocode({address: vm.addr})
      .then( (results, status) => {
        let coords = results[0].geometry.location;
        vm.mapCenter = [coords.lat(), coords.lng()];
        console.log('new center', vm.mapCenter);
        setMarkerVis(vm.radius);
      });
    } else {
      //default to large distance for blank field
      setMarkerVis(vm.radius);
    }
  };

  const setMarkerVis = radius => {
    console.log('radius', radius);
    for (var i = 0; i < vm.markerList.length; i++) {
      let inRangeBool = getDistance(vm.markerList[i].position, vm.mapCenter) < radius;
      vm.markerList[i].visible = inRangeBool || !radius; //make visible if no set radius
    }
  };

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
  };

}]);
