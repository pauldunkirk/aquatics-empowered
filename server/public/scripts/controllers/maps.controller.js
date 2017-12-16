app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  vm.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o&libraries=geometry";
  vm.mapCenter = [];
  vm.maxMarkers = 12;
  vm.markerList = [];
  vm.poolPhotos = {};
  //*************************************************************
  NgMap.getMap().then(function(map) {
    vm.map = map;
    console.log('Yay! We have a map! vm.map', vm.map);
    vm.getCurrentCenter = function() {
      vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
      console.log('I see you, your coordinates are', vm.mapCenter);
      getAllCoordsAndIds();
    };
  });
  //************** GET ALL in db by coords, SORT, SLICE,
  // ************** then send only the 12 ids back for more info for those pools ***************
  const getAllCoordsAndIds = () => {
    $http.get('/facilities/coordsandids')
    .then( res => {
      vm.allCoordsAndIds = res.data;
      console.log('Coords And Ids of all pools in db (not sorted)', vm.allCoordsAndIds);
      sortAndSliceIds(vm.allCoordsAndIds);
    }, err => console.log('GET allPools - error:', err)
  );}; // end get AllC oords And Ids

  //*************************************************************
  function sortAndSliceIds(allCoordsAndIds) {
    let coordArrayToSort = [];
    for (var i = 0; i < allCoordsAndIds.length; i++) {
      coordArrayToSort.push(
        {
          id: allCoordsAndIds[i].id,
          coords: allCoordsAndIds[i].coords,
          distance: getDistance(allCoordsAndIds[i].coords, vm.mapCenter)
        }
      ); // end push
    }; //end for loop
    let sortedCoordArray = coordArrayToSort.sort(function(a, b) { return a.distance - b.distance });
    let sortedAndSlicedCoordArray = sortedCoordArray.slice(0, vm.maxMarkers);
    console.log('sortedAndSlicedCoordArray (is sorted and sliced)', sortedAndSlicedCoordArray);
    let idsOfWantedPools = [];
    for (var i = 0; i < sortedAndSlicedCoordArray.length; i++) {
      idsOfWantedPools.push(sortedAndSlicedCoordArray[i].id);
    };// end for loop
    console.log('idsOfWantedPools (is sorted by distance)', idsOfWantedPools);
    getSelectedPools(idsOfWantedPools);
  }; // end sortAndSliceIds

  //*************************************************************
  function getSelectedPools(idsOfPoolsWanted) {
    $http({
      method: 'POST',
      url: '/facilities/getSelected',
      data: idsOfPoolsWanted
    }).then(
      function(res, err) {
        vm.selectedPoolsArray = res.data;
        console.log('selectedPoolsArray, (no longer sorted by distance)', vm.selectedPoolsArray);
        vm.markerList = createMarkerList(vm.selectedPoolsArray, vm.maxMarkers, vm.mapCenter);
        if (err) {
          console.log("error getting from db: ", err);
        };}
      );
    };

    //*************************************************************
    //see html: ng-repeat="r in vm.poolDetails.reviews
    function formatReview(rev) {
      return{
        rating: rev.rating,
        text: rev.text,
        author: rev.author_name,
        url: rev.profile_photo_url
      }};
      //creates Marker List from Pools List when calling in various places
      // html: markers as marker List, info-window as pool Details (showDetail(p), p in markerList)
      function createMarkerList(chosenPoolsArray, maxMarkers, center) {
        console.log('createMarkerList center', center);
        console.log('chosenPoolsArray, (not sorted at this point)', chosenPoolsArray);
        let poolsList = chosenPoolsArray.map( function(pool){
          return {
            //value from allPools, key found in pools List, then markerList, then clicked pool, then poolDetails
            id: pool.id,
            place_id: pool.google_place_id,
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
            // googleJson: pool.google_places_data,
            // || [] to prevent calling .map on null (throws error)
            reviews: (pool.google_places_data.reviews || []).map(formatReview)
          } // end of reconfiguring allPools, renamed poolsList
        } ); //end of map of allPools
        poolsList = poolsList.sort( function(a, b) { return a.distance - b.distance });
        poolsList = poolsList.slice( 0, maxMarkers );
        console.log('poolsList (sorted at this point) will become markerList', poolsList);
        // console.log('first pool in poolsList[0].position', poolsList[0].position);
        // console.log('first pool in poolsList[0].latitude', poolsList[0].latitude);
        // console.log('first pool in poolsList[0].longitude', poolsList[0].longitude);
        // console.log('first pool in poolsList[0].distance - distance from center of map to first pool in poolsList', poolsList[0].distance);
        return poolsList;
      };
      //****************************************************************************
      vm.poolSearch = () => {
        if (vm.addr && vm.map) {
          GeoCoder.geocode({address: vm.addr}) //ref see vestigial
          .then( (results, status) => {
            console.log('results best guess', results);
            let coords = results[0].geometry.location; //results[0]==Google's 'best guess'
            console.log('coords of result of best guess, buried in closure', coords);
            vm.map.center = [coords.lat(), coords.lng()];
            console.log('vm.mapCenter', vm.mapCenter);
            console.log('vm.map.center', vm.map.center);
            // this causes no new pins - withiout it, new pins but map stays
            // vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
            vm.showPhotos = false;
            getAllCoordsAndIds();
            // vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);
          });}};
          //****************************************************************************
          //html: on-dragend  -hide Info Window only here (from Ng-Map)
          vm.newCenter = () => {
            // console.log('newCenter -> vm.map', vm.map);
            console.log('newCenter -> vm.map.center buried in closure', vm.map.center);
            vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
            getAllCoordsAndIds();
            vm.showPhotos = false;
            // console.log('newCenter -> vm.mapCenter', vm.mapCenter);
            // vm.mapCenterLat = vm.mapCenter[0];
            // console.log('newCenter -> vm.mapCenterLat', vm.mapCenterLat);
            // vm.mapCenterLng = vm.mapCenter[1];
            // console.log('newCenter -> vm.mapCenterLng', vm.mapCenterLng);
            vm.map.hideInfoWindow('pool-iw');
            // vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);
          };
      //************* NO LONGER USING  ************************************************
      const getAllFacilities = () => {
        $http.get('/facilities/')
        .then( res => {
          vm.allFacilities = res.data;
          console.log('vm.allFacilities', vm.allFacilities);
          // console.log('******************* mapCenter in get All Facilities', vm.mapCenter);
          vm.markerList = createMarkerList(vm.allFacilities, vm.maxMarkers, vm.mapCenter);
          console.log('vm. marker List', vm.markerList);
        }, err => console.log('GET allPools - error:', err)
      );};
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
      //******************************************************************
      //twice html: click pin or info List Item (pool is from p in marker List)  -showInfoWindow (from Ng-Map)
      vm.showDetail = (e, pool) => {
        vm.showSeePhotosButton = false;
        vm.poolPhotos = {};
        vm.showPhotos = false;
        vm.poolDetails = pool; //clicked p in vm.markerList/poolsList
        vm.map.showInfoWindow('pool-iw', pool.id); //pool.id is db id not place_id
        console.log('pool.place_id', pool.place_id);
        getPoolPhotos(pool.place_id);
        if (vm.poolPhotos) {
          vm.showSeePhotosButton = true;
        }
        console.log('pool.place_id', pool.place_id);
        console.log('selected pool vm.poolDetails', vm.poolDetails);
        console.log('selected pool vm.poolDetails.reviews', vm.poolDetails.reviews);
      };

          //****************************************************************************
          // THESE ARE TRYING TO HIDE INFO WINDOW WHEN PARENT MAP IS CLICKED BUT NOT WHEN INFO WINDOW CHILD CLICKED
          // an angular search had this suggestion: ng-click="$event.stopPropagation()" on child element
          // this is jquery - crashing whole thing:
          // $(document).ready(function() {
          //     $('#ngmap').click(function(e) {
          //         if (e.target == this) {
          //             alert('Parent was clicked');
          //         }
          //     })
          // };
          // this works but hides when child clicked - only want when parent clicked
          // vm.hideInfoWindowOnClick = () => {
          //   if ('pool-iw') {
          //     vm.map.hideInfoWindow('pool-iw');
          //   }
          // };
          //****************************************************************************



          //****************************************************************************
          // TODO: different icons - ref see vestigial
          vm.getIcon = num => 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';
          // *********************** this is experimental *******
          vm.customMarkers = [
            {"address": "7140 Utica Lane, Chanhassen MN", "class": "my1", "description": "Aquatic Therapists"},
            {"address": "Minneapolis MN", "class": "my2", "description": "Hotels that allow Aquatic Therapy"},
          ];
          vm.currentLocation = [
            {"class": "my2", "description": "You are Here"}
          ];

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


          //
          //
          //TRYING TO MARRY therapistMap.html just as an exploration of how things work as opposed to a long-term solution
          //
          // var infoWindow = new google.maps.InfoWindow();
          // var googlePlacesAPI = new google.maps.places.PlacesService(vm.map);
          //
          // performSearch();
          //
          //
          // function performSearch() {
          //   var request = {
          //     bounds: vm.map.getBounds(),
          //     keyword: 'aquatic therapy'
          //   };
          //   googlePlacesAPI.nearbySearch(request, callback);
          // }
          //
          // function callback(results, status) {
          //   if (status !== google.maps.places.PlacesServiceStatus.OK) {
          //     console.error(status);
          //     return;
          //   }
          //   for (var i = 0, result; result = results[i]; i++) {
          //     addMarker(result);
          //   }
          // }
          //
          //
          //
          // function addMarker(place) {
          //   var marker = new google.maps.Marker({
          //     vm.map: vm.map,
          //     position: place.geometry.location,
          //     icon: {
          //       url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
          //       anchor: new google.maps.Point(10, 10),
          //       scaledSize: new google.maps.Size(25, 35)
          //     }
          //   });
          //
          //   google.maps.event.addListener(marker, 'click', function() {
          //     googlePlacesAPI.getDetails(place, function(result, status) {
          //       if (status !== google.maps.places.PlacesServiceStatus.OK) {
          //         console.error(status);
          //         return;
          //       }
          //       infoWindow.setContent(result.name + '\n ' + result.rating + ' stars ');
          //
          //       console.log('result', result);
          //       infoWindow.open(map, marker);
          //     });
          //   });
          //
          //   infoWindow.addListener('click', function() {
          //             infowindow.close();
          //           });
          // }


        }]); //end controller
