DIDNT USE OR CHANGED OR TOO MANY COMMENTS

***I took out this first log - but something to look into: why is it sorted before the .sort?
console.log('coords, ids, distance of all pools in db: coordArrayToSort (is sorted, hmm...)', coordArrayToSort);
let sortedCoordArray = coordArrayToSort.sort(function(a, b) { return a.distance - b.distance });
let sortedAndSlicedCoordArray = sortedCoordArray.slice(0, vm.maxMarkers);



// const defaultCenter = [44.9778, -93.2650]; //Minneapolis
// vm.mapCenter = defaultCenter;


    // *********************** this is experimental- not being called *******
    const getSomeFacilities = (id) => {
      $http.get('/facilities/getById' + id)
      .then( res => {
        vm.somePools = res.data;
        console.log('vm.somePools', vm.somePools);
        vm.markerList = createMarkerList(vm.somePools, vm.maxMarkers, vm.mapCenter);
        console.log('vm.markerList', vm.markerList);
      }, err => console.log('GET allPools - error:', err)
    );};
    // getSomeFacilities();

// *********************** NOT BEING CALLED ************* *******
  function createDistanceList(allCoordsArray, maxMarkers, center) {
    let coordsList = allCoordsArray.map( function(pool){
      return {
        id: pool.id,
        // position: pool.coords,
        // latitude: pool.coords[0],
        // longitude: pool.coords[1],
        distance: getDistance(pool.coords, center)
      } // end of reconfiguring allCoords, renamed coordsList
    } ); //end of map of allPools
    coordsList = coordsList.sort(function(a, b) { return a.distance - b.distance });
    coordsList = coordsList.slice( 0, maxMarkers );
    // BELOW NOT BEING LOGGED BECAUSE THIS IS NOT BEING CALLED
    console.log('coordsList will become markerList', coordsList);
    console.log('coordsList[0].latitude', coordsList[0].latitude);
    console.log('coordsList[0].longitude', coordsList[0].longitude);
    console.log('coordsList[0].distance - distance from center of map of first pool in coordsList', coordsList[0].distance);
    return coordsList;
  };





**************************************************************************************************************
map.controller


NgMap.getMap().then(function(map) {
  vm.map = map;
  console.log('Yay! We have a map! vm.map', vm.map);
  // vm.map.center is undefined until NgMap's "geo-callback" (see html): which calls get Current Center
  // which calls .lat and .lng on map.center.
  // I tried doing this with a .then promise but didn't seem to work
  // checkout NgMap's README - it uses getCenter() which I realized I didn't need.
  vm.getCurrentCenter = function() {
      // console.log('get Current Center -> vm.map.center (buried in closure until getCenter())', vm.map.center);
      // console.log('You are at: vm.map.getCenter()' + vm.map.getCenter());
      // vm.map.center = vm.map.getCenter();
      // console.log('vm.map.center after getCenter().Still buried in closure. Havent run lat() and lng()', vm.map.center);
      vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
      console.log('get Current Center -> vm.mapCenter', vm.mapCenter);
      // vm.mapCenterLat = vm.mapCenter[0];
      // console.log('get Current Center -> vm.mapCenterLat', vm.mapCenterLat);
      // vm.mapCenterLng = vm.mapCenter[1];
      // console.log('get Current Center -> vm.mapCenterLng', vm.mapCenterLng);
      //getAllFacilities();
      getAllCoordsAndIds();
    };



// console.log('getAllCoordsAndIds -> vm.allCoordsAndIds', vm.allCoordsAndIds);
// console.log('getAllCoordsAndIds -> vm.mapCenter', vm.mapCenter);
// console.log('getAllCoordsAndIds -> vm.maxMarkers', vm.maxMarkers);
// vm.markerList = createDistanceList(vm.allCoordsAndIds, vm.maxMarkers, vm.mapCenter);
// console.log('vm.markerList', vm.markerList);

// vm.poolCoords = vm.allCoordsAndIds[0].coords;
// console.log('getAllCoords -> vm.poolCoords', vm.poolCoords);

// let distanceFromCenter = getDistance(vm.poolCoords, vm.mapCenter);
// console.log('getAllCoords ->  distanceFromCenter', distanceFromCenter);
// vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);


************************************************************************
FROM Maps Controller

//****************************************************************************
  //P: only here (and html once) - poolDetails here and above
  vm.logPool = () => console.log('selected pool:', vm.poolDetails);


notes for   GeoCoder.geocode({address: vm.addr})"https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/docs/GeoCoder.html"

Too many notes: This code is STILL IN maps.controller.js: I copied it here with notes and deleted notes from maps controller file:
NgMap.getMap().then( map => {
  //J: "ANYTHING REQUIRING ACCESS TO GOOGLE API GOES within this ".then" function
  //J: map is returned as an accessor to all the google functionality via angular
  //P: blank map with properties/functionality but no values
  vm.map = map;
  console.log('map, which has no values yet', map);
  //J getAllFacilities in-turn calls createMarkerList() and I think i thought that required vm.map
  //P: ?? But neither createMarkerList nor getAllFacilities use vm.map ???
  //J it doesnt look like that is the case. you could try removing getAllFacilities() from here and may get a faster page load. //P: tried it- didn't seem to help
  console.log('map.mapUrl - Mpls center, no markers', map.mapUrl);
  //J: TODO: set map center to location of user (determined with from browser query)
  //J: cannot be done until we have an https domain (not free Heroku)
  getAllFacilities();
}); //end NgMap.getMap


//P: getIcon is only here and html - url ref: http://www.mattburns.co.uk/blog/2011/10/07/how-to-dynamically-choose-the-color-of-you-google-maps-marker-pin-using-javascript/
//P:  first is main pin color: #0065BD =blue, second is fill: FFFFFF =white
// P: TODO different pins for different types of pools
  vm.getIcon = num => 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';


//we are not adding facilities from the maps page - only geocoding: converting address info to coordinates to reset map
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

  //P: setMarkerVis previously called in newCenter and GeoCode (search) like this:   setMarkerVis(vm.radius);
    const setMarkerVis = radius => {
      console.log('radius', radius);
      for ( let i=0; i < vm.markerList.length; i++) {
        let dist = getDistance(vm.markerList[i].position, vm.mapCenter);
        let inRangeBool = dist < radius;
        vm.markerList[i].visible = inRangeBool || !radius;
    }
    };


  //P: reset is only here and html
  //P: BUT, hideInfoWindow is only here and 10 lines down and comes from Ng-Map
    vm.reset = () => {
      vm.addr = undefined; //see poolSearch and geoCodeAdd
      vm.radius = undefined; // see setMarkerVis
      vm.pool = undefined;
      vm.mapCenter = defaultCenter;
      vm.map.hideInfoWindow('pool-iw'); //see ngmap
      vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
    };
