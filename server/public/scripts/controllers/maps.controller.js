app.controller('MapsController', ['MapsFactory','$http', 'NgMap', 'GeoCoder', function(MapsFactory, $http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650]; //Minneapolis
  vm.mapCenter = defaultCenter;
  vm.maxMarkers = 2;
  vm.markerList = [];
  vm.poolsList = MapsFactory.factoryPools;
  console.log('vm.poolsList', vm.poolsList);
//*************************************************************
  NgMap.getMap().then( map => {
    vm.map = map;
    console.log('vm.map', vm.map);
    //J: TODO: set map center to location of user (determined from browser query) - need https domain (not free Heroku)
  });
//*************************************************************
  const getFacilities = () => {
    $http.get('/facilities/')
    .then( res => {
      vm.allPools = res.data;
      console.log('vm.allPools: GET all facilities response', vm.allPools);
      vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
      console.log('allPools+maxMarkers+mapCenter=createMarkerList=markerList', vm.markerList);
    },
    err => console.log('GET allPools - error:', err)
    );
  };
//*************************************************************
  getFacilities();
//******************************************************************
  //P: vm.allPools is poolArray, vm.mapCenter is center
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
        review => (review.rating + ' stars:\n' + review.text + ' - ' + review.author_name + ' ' + review.profile_photo_url
      ))
    }
    ))
    .sort( (a, b) => a.distance - b.distance )
    .slice( 0, maxMarkers )
  );
//******************************************************************
  //P: showDetail once here, once html.  showInfoWindow once here - from Ng-Map
  //P: vm.pool first created?? see poolArray and createMarkerList above
  vm.showDetail = (e, pool) => {
    vm.pool = pool; //set the pool that infoWindow will display on click
    vm.map.showInfoWindow('pool-iw', pool.id);
  };
//****************************************************************************
   //P: clickedWebsiteLink is only here (and html twice: infoWindow and markerList)
  vm.clickedWebsiteLink = url => window.open(url);
//****************************************************************************
   //P: newCenter is only here and once in html(on-dragend)
   //P: hideInfoWindow is only here - from Ng-Map
  vm.newCenter = () => {
    vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
    vm.map.hideInfoWindow('pool-iw');
    vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
};
//****************************************************************************
  //P: getIcon is only here and html - url ref see vestigial
  // P: TODO different pins for different types of pools
  vm.getIcon = num => 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';
//****************************************************************************
  vm.poolSearch = () => {
    if (vm.addr && vm.map) {
    //P:ref:https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/docs/GeoCoder.html
      GeoCoder.geocode({address: vm.addr})
        .then( (results, status) => {
      //J: Note: results[0]==Google's 'best guess'
          let coords = results[0].geometry.location;
          vm.mapCenter = [coords.lat(), coords.lng()];
          vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
        }); //end .then
      } //end if
    } //end vm.poolSearch;
//****************************************************************************
      //P: logPool is only here and html
      vm.logPool = () => console.log('selected pool:', vm.pool);
//****************************************************************************
//P: see createMarkerList and poolArray which populate vm.markerList
//J: use this instead of google.maps.geometry.spherical.computeDistance() because of API query limit
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
//****************************************************************************
}]);
