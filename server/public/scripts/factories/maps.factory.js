app.factory('MapsFactory', ['$http','$location', function($http, $location) {
    // console.log('Maps Factory running');

    var allPools = { allPoolsList: [] };

    getAllFacilities();

    function getAllFacilities() {
        $http({
          method: 'GET',
          url: '/facilities/'
        }).then(function(response) {
              allPools.allPoolsList = response.data;
              // console.log('Factory allPools (get all facilities) response.data', allPools);
              // console.log('allPools.list', allPools.list);
            });
          }

        return {
        factoryPools: allPools
    };
}]);
