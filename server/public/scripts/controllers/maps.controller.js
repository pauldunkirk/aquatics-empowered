app.controller('MapsController', ['$location', function($location) {
var self = this;
self.myMap = function () {
      myCenter = new google.maps.LatLng(44.9778, -93.2650);
      var mapOptions = {
          center: myCenter,
          zoom: 12,
          scrollwheel: false,
          draggable: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

      var marker = new google.maps.Marker({
          position: myCenter,
      });
      marker.setMap(map);
  };

}]);
