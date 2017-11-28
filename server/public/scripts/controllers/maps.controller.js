app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  vm.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o&libraries=geometry";
  const defaultCenter = [44.9778, -93.2650]; //Minneapolis
  vm.mapCenter = defaultCenter;
  vm.maxMarkers = 12;
  vm.markerList = [];
  vm.poolPhotos = {};
  //*************************************************************
  NgMap.getMap().then( map => {
    vm.map = map;
    console.log('Yay! We have a map! vm.map', vm.map);
    // console.log('vm.map.center, hidden in closure like in newCenter()', vm.map.center);
    vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
    // console.log('vm.mapCenter', vm.mapCenter);
    vm.mapCenterLat = vm.mapCenter[0];
    console.log('vm.mapCenterLat', vm.mapCenterLat);
    vm.mapCenterLng = vm.mapCenter[1];
    console.log('vm.mapCenterLng', vm.mapCenterLng);
  });
  //*************************************************************
  //see html: ng-repeat="r in vm.poolDetails.reviews
  function formatReview(rev) {
    return{
      rating: rev.rating,
      text: rev.text,
      author: rev.author_name,
      url: rev.profile_photo_url
    }};
    //see maps.html: markers as markerList, info-window as poolDetails (showDetail(p), p in markerList)
    function createMarkerList(allPoolsArray, maxMarkers, center) {
      let poolsList = allPoolsArray.map( function(pool){
        return {
          //value from allPools, key found in poolsList, then markerList, then clicked pool, then poolDetails
          id: pool.id,
          position: pool.coords,
          latitude: pool.coords[0],
          longitude: pool.coords[1],
          title: pool.name,
          website: pool.url,
          street_address: pool.street_address,
          city: pool.city,
          distance: getDistance(pool.coords, center),
          state: pool.state,
          type: pool.pool_type,
          zip: pool.zip,
          phone: pool.phone,
          visible: true,
          googleJson: pool.google_places_data,
          // || [] to prevent calling .map on null (throws error)
          reviews: (pool.google_places_data.reviews || []).map(formatReview)
        } // end of reconfiguring allPools, renamed poolsList
      } ); //end of map of allPools
      poolsList = poolsList.sort( function(a, b) { return a.distance - b.distance });
      poolsList = poolsList.slice( 0, maxMarkers );
      console.log('poolsList will become markerList', poolsList);
      console.log('poolsList[0].position', poolsList[0].position);
      console.log('poolsList[0].latitude', poolsList[0].latitude);
      console.log('poolsList[0].longitude', poolsList[0].longitude);
      console.log('poolsList[0].distance - distance from center of map of first pool in poolsList', poolsList[0].distance);
      return poolsList;
    };
    // *********************** this is experimental *******
    function createDistanceList(allCoordsArray, maxMarkers, center) {
      let coordsList = allCoordsArray.map( function(pool){
        return {
          id: pool.id,
          position: pool.coords,
          latitude: pool.coords[0],
          longitude: pool.coords[1],
          distance: getDistance(pool.coords, center)
        } // end of reconfiguring allCoords, renamed coordsList
      } ); //end of map of allPools
      coordsList = coordsList.sort( function(a, b) { return a.distance - b.distance });
      coordsList = coordsList.slice( 0, maxMarkers );
      console.log('coordsList will become markerList', coordsList);
      console.log('coordsList[0].latitude', coordsList[0].latitude);
      console.log('coordsList[0].longitude', coordsList[0].longitude);
      console.log('coordsList[0].distance - distance from center of map of first pool in coordsList', coordsList[0].distance);
      return coordsList;
    };
    // *********************** this is experimental- not being called *******
    const getSomeFacilities = (id) => {
      $http.get('/facilities/getById' + id)
      .then( res => {
        vm.somePools = res.data;
        console.log('vm.somePools', vm.somePools);
        // vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
        vm.markerList = createMarkerList(vm.somePools, vm.maxMarkers, vm.mapCenter);
        console.log('vm.markerList', vm.markerList);
      }, err => console.log('GET allPools - error:', err)
    );};
    // getSomeFacilities();
    //**************ANOTHER EXPERIMENTAL - calling for coords and id***************
    const getAllCoordsAndIds = () => {
      $http.get('/facilities/coordsandids')
      .then( res => {
        vm.allCoordsAndIds = res.data;
        console.log('getAllCoordsAndIds -> vm.allCoordsAndIds', vm.allCoordsAndIds);
        console.log('getAllCoordsAndIds -> vm.mapCenter', vm.mapCenter);
        console.log('getAllCoordsAndIds -> vm.maxMarkers', vm.maxMarkers);
        vm.markerList = createDistanceList(vm.allCoordsAndIds, vm.maxMarkers, vm.mapCenter);
        console.log('vm.markerList', vm.markerList);
        // vm.poolCoords = vm.allCoordsAndIds[0].coords;
        // console.log('getAllCoords -> vm.poolCoords', vm.poolCoords);

        // let distanceFromCenter = getDistance(vm.poolCoords, vm.mapCenter);
        // console.log('getAllCoords ->  distanceFromCenter', distanceFromCenter);
        // vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);

      }, err => console.log('GET allPools - error:', err)
    );};
    // getAllCoordsAndIds();
    //*************working one ************************************************
    const getAllFacilities = () => {
      $http.get('/facilities/')
      .then( res => {
        vm.allFacilities = res.data;
        console.log('vm.allFacilities', vm.allFacilities);
        vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);
        console.log('vm.markerList', vm.markerList);
      }, err => console.log('GET allPools - error:', err)
    );};
    getAllFacilities();
    //******************************************************************
    const getPoolPhotos = (place_id) => {
      console.log('getting photo for poolId', place_id);
      $http.get('/photos/' + place_id)
      .then(res => {
        vm.poolPhotos = res.data;
        console.log('vm.poolPhotos', vm.poolPhotos);
        console.log('vm.poolPhotos.photoUrlsArray', vm.poolPhotos.photoUrlsArray);
      }, err => console.log('GET pool photos error:', err)
    );};


// vm.showPhotos = () => {
//   if(vm.poolPhotos) {
//     vm.showPhotos = true;
//   } else{
//     vm.showPhotos = false;
//   }
// };

    //once here (twice html: click pins) -showInfoWindow only here (from Ng-Map)
    //******************************************************************
    vm.showDetail = (e, pool) => {
      vm.poolPhotos = {};
      vm.showPhotos = false;
      vm.poolDetails = pool; //clicked p in vm.markerList/poolsList/allPools
      vm.map.showInfoWindow('pool-iw', pool.id); //pool.id is db id not place_id
      getPoolPhotos(pool.googleJson.place_id);
      console.log('pool.googleJson.place_id', pool.googleJson.place_id);
      console.log('selected pool vm.poolDetails', vm.poolDetails);
      console.log('selected pool vm.poolDetails.reviews', vm.poolDetails.reviews);
    };
    //****************************************************************************
    vm.poolSearch = () => {
      if (vm.addr && vm.map) {
        GeoCoder.geocode({address: vm.addr}) //ref see vestigial
        .then( (results, status) => {  //results[0]==Google's 'best guess'
        console.log('results', results);
        let coords = results[0].geometry.location;
        vm.mapCenter = [coords.lat(), coords.lng()];
        vm.showPhotos = false;
        vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);
      });}};
      //****************************************************************************
      //once here (once html: on-dragend) -hide Info Window only here (from Ng-Map)
      vm.newCenter = () => {
        console.log('newCenter -> vm.map', vm.map);
        console.log('newCenter -> vm.map.center', vm.map.center);
        vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
        vm.showPhotos = false;

        console.log('newCenter -> vm.mapCenter', vm.mapCenter);
        vm.mapCenterLat = vm.mapCenter[0];
        console.log('newCenter -> vm.mapCenterLat', vm.mapCenterLat);
        vm.mapCenterLng = vm.mapCenter[1];
        console.log('newCenter -> vm.mapCenterLng', vm.mapCenterLng);

        vm.map.hideInfoWindow('pool-iw');
        vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);
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
