app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650]; //Minneapolis
  vm.mapCenter = defaultCenter;
  vm.maxMarkers = 10;
  vm.markerList = [];
  vm.poolPhotos = [];
//*************************************************************
  NgMap.getMap().then( map => {
    vm.map = map;
    console.log('Yay! We have a map! vm.map', vm.map);
    //TODO: set map center to location of user (from browser query) - need https
  });
//*************************************************************
//see html: vm.poolDetails.reviews
  function formatReview(rev) {
     return rev.rating + ' stars:\n' + rev.text + ' - ' +
     rev.author_name + ' ' + rev.profile_photo_url;
   };
   //see maps.html: markers as markerList and info-window as poolDetails (showDetail(p), p in markerList)
  function createMarkerList(allPoolsArray, maxMarkers, center) {
     let poolsList = allPoolsArray.map( function(pool){
       return {
         //value is in allPools, key is in pool, poolsList, markerList, poolDetails
         id: pool.id,
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
         // || [] to prevent calling .map on null (throws error)
         reviews: (pool.google_places_data.reviews || []).map(formatReview)
       } // end of reconfiguring pools array, renamed poolsList
     } ); //end of map method
     poolsList = poolsList.sort( function(a, b) { return a.distance - b.distance });
     poolsList = poolsList.slice( 0, maxMarkers )
     console.log('poolsList becomes markerList', poolsList);
     return poolsList;
    //  formatReview();
   };
//******************************************************************
   const getFacilities = () => {
     $http.get('/facilities/')
     .then( res => {
       vm.allPools = res.data;
       console.log('vm.allPools: GET all facilities response', vm.allPools);
       vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
       console.log('markerList was poolsList', vm.markerList);
     }, err => console.log('GET allPools - error:', err)
     );};
 //*************************************************************
   getFacilities();

//******************************************************************
   const getPoolPhotos = (place_id) => {
     console.log('getting photo for poolId', place_id);
     $http.get('/photos/' + place_id)
       .then(res => {
         vm.poolPhotos = res.data;
         console.log('got pool photos - vm.poolPhotos', vm.poolPhotos);
       });
   };
//******************************************************************
  //only here (and twice html: click pins) -showInfoWindow only here (from Ng-Map)
  vm.showDetail = (e, pool) => {
    console.log('pool.googleJson.place_id', pool.googleJson.place_id);
		getPoolPhotos(pool.googleJson.place_id);
    vm.poolDetails = pool; //set the pool that infoWindow will display on click
    vm.map.showInfoWindow('pool-iw', pool.id);
    console.log('selected pool vm.poolDetails', vm.poolDetails);
  };
//****************************************************************************
   //only here (and once html: on-dragend) -hideInfoWindow only here (from Ng-Map)
  vm.newCenter = () => {
    vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
    vm.map.hideInfoWindow('pool-iw');
    vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
  };
//****************************************************************************
  vm.poolSearch = () => {
    if (vm.addr && vm.map) {
      GeoCoder.geocode({address: vm.addr}) //ref see vestigial
        .then( (results, status) => {  //results[0]==Google's 'best guess'
          let coords = results[0].geometry.location;
          vm.mapCenter = [coords.lat(), coords.lng()];
          vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
        });}};
//****************************************************************************
  //P: only here (and html twice) - ref see vestigial
  vm.getIcon = num => 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';
//****************************************************************************
  //P: only here (and html twice: infoWindow and markerList#2)
  vm.clickedWebsiteLink = url => window.open(url);
//****************************************************************************
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
