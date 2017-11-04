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
//see html: ng-repeat="review in vm.poolDetails.reviews">{{review}}
  function formatReview(rev) {
     return rev.rating + ' stars:\n' + rev.text + ' - ' +
     rev.author_name;
      // + ' ' + rev.profile_photo_url;
     console.log('rev.profile_photo_url', rev.profile_photo_url);
   };
   //see maps.html: markers as markerList, info-window as poolDetails (showDetail(p), p in markerList)
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
         type: pool.pool_type,
         zip: pool.zip,
         visible: true,
         googleJson: pool.google_places_data,
         // || [] to prevent calling .map on null (throws error)
         reviews: (pool.google_places_data.reviews || []).map(formatReview)
       } // end of reconfiguring allPools, renamed poolsList
     } ); //end of map of allPools
     poolsList = poolsList.sort( function(a, b) { return a.distance - b.distance });
     poolsList = poolsList.slice( 0, maxMarkers );
     console.log('poolsList will become markerList', poolsList);
     console.log('poolsList[1].reviews', poolsList[1].reviews);
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
       console.log('vm.markerList', vm.markerList);
      //  console.log('vm.markerList.googleJson', vm.markerList[1].googleJson);
      // console.log('markerList.googleJson.reviews', vm.markerList[1].googleJson.reviews);
      // console.log('vm.markerList[1].googleJson.reviews[0].profile_photo_url', vm.markerList[1].googleJson.reviews[0].profile_photo_url);
     }, err => console.log('GET allPools - error:', err)
     );};
//*************************************************************
   getFacilities();
//******************************************************************
  //once here (twice html: click pins) -showInfoWindow only here (from Ng-Map)
  vm.showDetail = (e, pool) => {
    console.log('pool which is param of showDetail', pool);
    console.log('pool.reviews', pool.reviews);
    console.log('pool.googleJson.reviews', pool.googleJson.reviews);
    console.log('pool.googleJson.place_id', pool.googleJson.place_id);
		getPoolPhotos(pool.googleJson.place_id);
    vm.poolDetails = pool; //clicked p in vm.markerList/poolsList/allPools
    vm.map.showInfoWindow('pool-iw', pool.id); //pool.id is db id not place_id
    console.log('selected pool vm.poolDetails', vm.poolDetails);
    console.log('vm.poolDetails.googleJson.reviews[1].profile_photo_url', vm.poolDetails.googleJson.reviews[0].profile_photo_url);
  };
//******************************************************************
  const getPoolPhotos = (place_id) => {
    console.log('getting photo for poolId', place_id);
     $http.get('/photos/' + place_id)
          .then(res => {
            vm.poolPhotos = res.data;
            console.log('got pool photos - vm.poolPhotos', vm.poolPhotos);
         });};
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
   //once here (once html: on-dragend) -hideInfoWindow only here (from Ng-Map)
  vm.newCenter = () => {
    vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
    vm.map.hideInfoWindow('pool-iw');
    vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
  };
//****************************************************************************
  // TODO: different icons - ref see vestigial
  vm.getIcon = num => 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';
//****************************************************************************
  vm.clickedWebsiteLink = url => window.open(url);
//****************************************************************************
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
//****************************************************************************
}]); //end controller
