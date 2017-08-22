app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650]; //Minneapolis coords
  vm.maxMarkers = 15;

  vm.markerList = [];
  vm.mapCenter = defaultCenter;

  NgMap.getMap().then( map => {
    vm.map = map; //to access gMaps API features
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
      vm.sortedList = sortByDistance(vm.allPools, vm.mapCenter);
      console.log('sortedList', vm.sortedList);
      vm.markerList = createMarkerList(vm.sortedList, vm.maxMarkers);
      vm.pool = vm.markerList[0]; //initialize for infoWindow
    },
      res => console.log('GET pools - error:', res)
    );
  };

  const createMarkerList = (poolArray, numMarkers) => (
    poolArray.map( (pool, index) => (
      { id: pool.id,
        position: [pool.lat, pool.lng],
        title: pool.name,
        website: pool.url,
        street_address: pool.street_address,
        city: pool.city,
        proximityRank: index + 1,
        distance: pool.distance,
        state: pool.state,
        zip: pool.zip,
        visible: true }
    ) )
    .slice( 0, numMarkers )
  );

  vm.poolSearch = () => {
    if (vm.addr && vm.map) {
      //determine and set new map center coordsxx
      GeoCoder.geocode({address: vm.addr})
      .then( (results, status) => {
        //Note: results[0]==Google's 'best guess'
        let coords = results[0].geometry.location;
        vm.mapCenter = [coords.lat(), coords.lng()];
        vm.sortedList = sortByDistance(vm.allPools, vm.mapCenter);
        vm.markerList = createMarkerList(vm.sortedList, vm.maxMarkers);
        setMarkerVis(vm.radius);
      });
    } else {
      setMarkerVis(vm.radius);
    }
  };

  const sortByDistance = (list, center) => {
    for (let i = 0; i < list.length; i++) {
      list[i].distance = getDistance([list[i].lat, list[i].lng], center);
    }
    return list.sort( (a, b) => a.distance - b.distance );
  };


  const setMarkerVis = radius => {
    for ( let i=0; i < vm.markerList.length; i++) {
      let dist = getDistance(vm.markerList[i].position, vm.mapCenter);
      let inRangeBool = dist < radius;
      vm.markerList[i].visible = inRangeBool || !radius;
    }
  };

  //use this instead of google.maps.geometry.spherical.computeDistance because of API query limit
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

  // markers.reduce(function (prev, curr) {
  //   var cpos = getDistance(location.position, curr.position);
  //   var ppos = getDistance(location.position, prev.position);
  //   return cpos < ppos ? curr : prev;
  // }).position;

}]);
