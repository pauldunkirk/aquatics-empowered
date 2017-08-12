
app.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCAlpI__XCJRk774DrR8FMBBaFpEJdkH1o',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
})
.controller('MapsController', ['$location', '$scope', 'uiGmapGoogleMapApi', function($location, $scope, uiGmapGoogleMapApi) {
  console.log('maps controller running');
  var areaLat      = 45,
      areaLng      = -93,
      areaZoom     = 8;

  $scope.map     = {
    center: { latitude: areaLat, longitude: areaLng },
    zoom: areaZoom
  };
  $scope.options = { scrollwheel: false };


  
  uiGmapGoogleMapApi.then(function(maps) {
    console.log('map ready');
  });


}]);
