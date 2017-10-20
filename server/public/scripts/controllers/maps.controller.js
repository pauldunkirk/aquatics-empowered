app.controller('MapsController', ['$http', 'NgMap', 'GeoCoder', function($http, NgMap, GeoCoder) {
  const vm = this;
  const defaultCenter = [44.9778, -93.2650]; //Minneapolis coords
  vm.mapCenter = defaultCenter;
  vm.maxMarkers = 20;
  vm.markerList = [];
//*************************************************************
  NgMap.getMap().then( map => {
    //J: "ANYTHING REQUIRING ACCESS TO GOOGLE API GOES within this ".then" function
    //J: map is returned as an accessor to all the google functionality via angular
    vm.map = map; //J: "to access gMaps API features"
    //?? P: from http.get getFacilities() see line 69
    //J getFacilities in-turn calls createMarkerList() and I think i thought that required vm.map
    //J it doesnt look like that is the case. you could try removing getFacilities() from here and may get a faster page load.
    console.log('map', map); //P: this gets logged on page load
    console.log('markers', map.markers); // P: ?? why undefined?
    //J: TODO: set map center to location of user (determined with from browser query)
    //J: cannot be done until we have an https domain (not free Heroku)
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
		console.log('pool clicked', pool);
		getPoolPhoto(pool.googleJson.place_id);
		
    vm.pool = pool; //set the pool that infoWindow will display on click
    vm.map.showInfoWindow('pool-iw', pool.id);
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

	const getPoolPhoto = (place_id) => {
		console.log('getting photo for poolId', place_id);
		$http.get('/photos/' + place_id)
			.then(res => {
				console.log('got pool photos', res);
			});
	}

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
          review => (review.rating + ' stars:\n' + review.text + ' - ' + review.author_name + ' ' + review.profile_photo_url

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

}]);
