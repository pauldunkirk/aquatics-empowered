app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;

  const defaultCenter = [44.9778, -93.2650]; //Minneapolis coords
  vm.mapCenter = defaultCenter;

  vm.maxMarkers = 30;
  vm.markerList = [];


//*************************************************************

  NgMap.getMap().then( map => {
    //J: "ANYTHING REQUIRING ACCESS TO GOOGLE API GOES IN HERE"
      // ?? P:where is 'here?' within NgMap.getMap()? So, 'map' and getFacilities()?
    vm.map = map; //J: "to access gMaps API features"
    //?? P: from http.get getFacilities() see line 69

    console.log('map', map); //P: this gets logged on page load
    console.log('markers', map.markers); // P: ?? why undefined?

    //J: TODO: set map center to location of user (determined with from browser query)

    getFacilities(); //J: run $http request to server for nearby pools
  }); //end NgMap.getMap


//*************************************************************

//P: logPool is only here and html
  vm.logPool = () => console.log('selected pool:', vm.pool);
//P: clicked is only here and html
  vm.clicked = url => window.open(url); //open facility website in new tab

//P: getIcon is only here and html - url ref: http://www.mattburns.co.uk/blog/2011/10/07/how-to-dynamically-choose-the-color-of-you-google-maps-marker-pin-using-javascript/
//P:  first is main pin color: #0065BD =blue, second is fill: FFFFFF =white
// P: TODO different pins for different types of pools
  vm.getIcon = num => 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';

//P: showDetail is only here and html
//P: BUT, showInfoWindow is only here and comes from Ng-Map
  vm.showDetail = (e, pool) => {
    vm.pool = pool; //set the pool that infoWindow will display on click
    vm.map.showInfoWindow('pool-iw', pool.id);
  };
//P: reset is only here and html
//P: BUT, hideInfoWindow is only here and 10 lines down and comes from Ng-Map
  vm.reset = () => {
    vm.addr = undefined;
    vm.radius = undefined;
    vm.pool = undefined;
    vm.mapCenter = defaultCenter;
    vm.map.hideInfoWindow('pool-iw'); //see ngmap
    vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
  };
  //P: newCenter is only here and html
  //P: BUT, hideInfoWindow is only here and 10 lines up and comes from Ng-Map
  vm.newCenter = () => {
    vm.mapCenter = [vm.map.center.lat(), vm.map.center.lng()];
    vm.map.hideInfoWindow('pool-iw');
    vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
    setMarkerVis(vm.radius);
  };



//******************************************************************
//this is called in NgMap.getMap()
  const getFacilities = () => {
    $http.get('/facilities/')
    .then( res => {
      vm.allPools = res.data;
      console.log('logging allPools', vm.allPools);
      vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
      console.log('logging markerList', vm.markerList);
    },
      err => console.log('GET pools - error:', err)
    );
  };

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

//P: createMarkerList only in maps controller
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
          review => (review.rating + ' stars:\n' + review.text + ' - ' + review.author_name
        ) )

      }
    ) )
    .sort( (a, b) => a.distance - b.distance )
    .slice( 0, maxMarkers )
  );

  vm.poolSearch = () => {
    if (vm.addr && vm.map) {
      //J: determine and set new map center coordsxx
      // P: GeoCoder.geocode reference: https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/docs/GeoCoder.html
      // P: see other GeoCoder.geocode in line 144 in geoCodeAdd
      GeoCoder.geocode({address: vm.addr})
      .then( (results, status) => {
        //J: Note: results[0]==Google's 'best guess'
        let coords = results[0].geometry.location;
        vm.mapCenter = [coords.lat(), coords.lng()];
        vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
        setMarkerVis(vm.radius);
      });
    } else {
      setMarkerVis(vm.radius);
    }
  };

  const setMarkerVis = radius => {
    for ( let i=0; i < vm.markerList.length; i++) {
      let dist = getDistance(vm.markerList[i].position, vm.mapCenter);
      let inRangeBool = dist < radius;
      vm.markerList[i].visible = inRangeBool || !radius;
    }
  };

//P: see 101 (createMarkerList and poolArray which populate vm.markerList) and 136 (setMarkerVis)
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

// WHAT DOES THIS DO?
// compare geoCodeAdd to geocodeAdd (notice capital 'C') in admin contr line 258
  // const geoCodeAdd = facility => {
  //   let addr = facility.street_address + ', ' + facility.city + ' ' + facility.state;
  //   GeoCoder.geocode({address: addr})
  //   .then( results => {
  //     let zipCmp = results[0].address_components.find(
  //       addrCmp => addrCmp.types[0] == 'postal_code');
  //     if (zipCmp) {
  //       let coords = results[0].geometry.location;
  //       facility.coords = [coords.lat(), coords.lng()];
  //       facility.zip = zipCmp.long_name;
  //       facility.google_place_id = results[0].place_id;
  //       console.log('geocoded facility:', facility);
  //       addFacility(facility);
  //     } else {
  //       console.log('no zip found:', addr, results);
  //     }
  //   });
  // };

  //P: WHAT IS ALL OF THIS??
  //P: only instance of convertAndPostJSON
  // P: calls geoCodeAdd and pulsePost
  // const convertAndPostJSON = (route, index=0) => {
  //   const pulsePost = list => {
  //     if (index < list.length - 1) {
  //       setTimeout( () => {
  //         geoCodeAdd(list[index++]);
  //         pulsePost(list);
  //       }, 1100);
  //     }
  //     console.log(list.length - index, 'facilities remaining');
  //   };
  //   $http.get(route)
  //   .then( res => {
  //     pulsePost(res.data);
  //     console.log('pulsePost route', route);
  //     console.log('pulsePost', res.data);
  //   },
  //     err => console.error('GET JSON facilities - error:', err)
  //   );
  // };
  //end convertAndPostJSON

}]); //end MapsController
