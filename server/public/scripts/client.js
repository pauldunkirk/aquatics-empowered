var app = angular.module('myApp', ['ngRoute', 'ngMap', ]);
// var app = angular.module('myApp', ['ngRoute','ui.bootstrap', 'ngMap', ]);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
   .when('/home', {
     templateUrl: '/views/home.html',
     controller: 'HomeController',
     controllerAs: 'vm'
 }).when('/maps', {
    templateUrl: '/views/templates/maps.html',
    controller: 'MapsController',
    controllerAs: 'vm'
 }).when('/admin', {
    templateUrl: '/views/templates/admin.html',
    controller: 'AdminController',
    controllerAs: 'vm'
  }).when('/testMap', {
     templateUrl: '/views/templates/testMap.html',
     controller: 'HomeController',
     controllerAs: 'vm'
 }).otherwise({
    redirectTo: '/home'
 });
}]);

/***************************ANGULAR SEARCH FILTERS***************************/
app.filter('startFrom', function() {
  return function(input, start) {
    start = +start; //parse to int
    return input.slice(start);
  };
});

app.filter('excludeByStatus', function () {
  return function (items, excludedList) {
    var ret = [];
    angular.forEach(items, function (item) {
      if (excludedList.indexOf(item.status) === -1) {
          ret.push(item);
      }
    });
    return ret;
  };
});

app.filter('true_false', function() {
    return function(text, length, end) {
        if (text) {
            return 'Yes';
        }
        return 'No';
    };
});


// }).when('/home2', {
//     templateUrl: '/views/home2.html',
//     controller: 'Home2Controller',
//     controllerAs: 'vm'
// }).when('/surveys', {
//     templateUrl: '/views/surveys.html',
//     controller: 'HomeController',
//     controllerAs: 'vm'
// }).when('/survey-facilities', {
//    templateUrl: '/views/survey-facilities.html',
//    controller: 'HomeController',
//    controllerAs: 'vm'
// }).when('/survey-therapists', {
//    templateUrl: '/views/survey-therapists.html',
//    controller: 'HomeController',
//    controllerAs: 'vm'
// }).when('/survey-poolusers', {
//    templateUrl: '/views/survey-poolusers.html',
//    controller: 'HomeController',
//    controllerAs: 'vm'
