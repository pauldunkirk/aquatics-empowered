
app.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
})
.controller('MapsController', ['$http', '$location', '$scope', 'uiGmapGoogleMapApi', function($http, $location, $scope, uiGmapGoogleMapApi) {
  console.log('maps controller running');
  var markerList   = [],
      areaLat      = 45,
      areaLng      = -93,
      areaZoom     = 8;

  $scope.map     = {
    center: { latitude: areaLat, longitude: areaLng },
    zoom: areaZoom
  };
  $scope.options = { scrollwheel: false };

  uiGmapGoogleMapApi.then(function(maps) {
  const gIcon = {
    url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=1|0065BD|FFFFFF",
    size: new google.maps.Size(20,30),
    anchor: new google.maps.Point(6,20),
    // infoWindowAnchor: new google.maps.Point(5,1)
  };

  function getPools() {
    //ajax call to get pools from JSON
    $http.get('/poolList/')
    .then(function(res) {
      console.log('res:', res.data);
      markerList = createMarkerList(res.data);
    },
    function(res) {
      console.log('get error:', response);
    });
  }
  getPools();

  function createMarkerList(poolArray) {
    poolArray.map(pool => {
      const options = {
        label: pool.name,
        icon: gIcon
      };
      const coords = new google.maps.LatLng(pool.lat, pool.lng);
      const marker = new google.maps.Marker( {
        idKey: pool.id,
        coords,
        options,
      } );
      console.log("marker:", marker);
      console.log("pool", pool);

      return marker;
    });
  }

    console.log('map ready');
  });


}]);
