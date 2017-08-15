app.controller('MapsController', ['$http', 'NgMap', function($http, NgMap) {
  const vm = this;
  vm.markerList = [];
  const apiKey = "AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o";
  vm.apiUrl = "https://maps.google.com/maps/api/js?key=" + apiKey; 
  const getPools = () => {
    $http.get('/poolList/')
    .then( res => {
      vm.markerList = createMarkerList(res.data);
      vm.pool = vm.markerList[0]; //initialize for infoWindow
      console.log('vm.markerList', vm.markerList);
    },
      res => console.log('GET pools - error:', res)
    );
  };

  const createMarkerList = poolArray => (
    poolArray.map( pool => (
      { id: pool.id,
        position: [pool.lat, pool.lng],
        title: pool.name,
        website: pool.url,
        street_address: pool.street_address,
        city: pool.city,
        state: pool.state,
        zip: pool.zip }
    ) )
  );

  getPools(); //

  vm.showDetail = (e, pool) => {
    vm.pool = pool; //set the pool that infowindow will display
    vm.map.showInfoWindow('pool-iw', pool.id);
  };

  vm.clicked = url => window.open(url); //open website in new tab

  NgMap.getMap().then( map => {
    vm.map = map; //to access showInfoWindow etc
    console.log(map.getCenter());
    console.log('markers', map.markers);
    console.log('shapes', map.shapes);
  });

}]);




// const urlMain = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=";
// const urlColor = "|0065BD|FFFFFF";
// const gIcon = {
//   size: new google.maps.Size(20,30),
//   anchor: new google.maps.Point(6,20),
// };







  //
  // $scope.markerList   = [];
  // var areaLat      = 44.9778,
  //     areaLng      = -93.2650,
  //     areaZoom     = 10;
  //
  // $scope.map     = {
  //   center: { latitude: areaLat, longitude: areaLng },
  //   zoom: areaZoom
  // };
  // uiGmapGoogleMapApi.then(function(maps) {
  // const gIcon = {
  //   url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=1|0065BD|FFFFFF",
  //   size: new google.maps.Size(20,30),
  //   anchor: new google.maps.Point(6,20),
  // };
  //
  // function getPools() {
  //   //ajax call to get pools from JSON
  //   $http.get('/poolList/')
  //   .then(function(res) {
  //     console.log('res:', res.data);
  //     $scope.markerList = createMarkerList(res.data);
  //     console.log('$scope.markerList', $scope.markerList);
  //   },
  //   function(res) {
  //     console.log('get error:', response);
  //   });
  // }
  // getPools();
  //
  // function createMarkerList(poolArray) {
  //   return poolArray.map(pool => {
  //     return {
  //       id: pool.id, //unique id required
  //       coords: { latitude: pool.lat, longitude: pool.lng },
  //       options: { label: pool.name, icon: gIcon }
  //     };
  //   });
  // }
  //
  //   console.log('map ready');
  // });
  //
