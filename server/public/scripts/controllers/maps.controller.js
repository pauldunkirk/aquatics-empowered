app.controller('MapsController', ['$http', '$location', '$scope', 'uiGmapGoogleMapApi', function($http, $location, $scope, uiGmapGoogleMapApi) {
  console.log('maps controller running');
  $scope.markerList   = [];
  var areaLat      = 44.9778,
      areaLng      = -93.2650,
      areaZoom     = 10;

  $scope.map     = {
    center: { latitude: areaLat, longitude: areaLng },
    zoom: areaZoom
  };
  uiGmapGoogleMapApi.then(function(maps) {
  const gIcon = {
    url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=1|0065BD|FFFFFF",
    size: new google.maps.Size(20,30),
    anchor: new google.maps.Point(6,20),
  };

  function getPools() {
    //ajax call to get pools from JSON
    $http.get('/poolList/')
    .then(function(res) {
      console.log('res:', res.data);
      $scope.markerList = createMarkerList(res.data);
      console.log('$scope.markerList', $scope.markerList);
    },
    function(res) {
      console.log('get error:', response);
    });
  }
  getPools();

  function createMarkerList(poolArray) {
    return poolArray.map(pool => {
      return {
        id: pool.id, //unique id required 
        coords: { latitude: pool.lat, longitude: pool.lng },
        options: { label: pool.name, icon: gIcon }
      };
    });
  }

    console.log('map ready');
  });


}]);
