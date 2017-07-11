var app = angular.module('myApp', ['ngRoute','ui.bootstrap']);
// ui.bootstrap allows toggleable nav bar to begin collapsed- see nav.html
//possibly in the future, use these tools:
// var myApp = angular.module('myApp', ['ngRoute', 'xeditable', 'firebase', 'ui.bootstrap', 'smart-table', 'angular-touch', 'angular-animate']); //then source in html


app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
         .when ('/login', {
          templateUrl: '/views/login.html',
          controller: 'LoginController',
          controllerAs: 'login'
        }).when ('/maps', {
            templateUrl: '/views/templates/maps.html',
            controller: 'MapsController',
            controllerAs: 'maps'
        }).when ('/home1', {
            templateUrl: '/views/home1.html',
            controller: 'Home1Controller',
            controllerAs: 'home1'
        }).when ('/home2', {
            templateUrl: '/views/home2.html',
            controller: 'Home2Controller',
            controllerAs: 'home2'
        }).otherwise ({
            redirectTo: '/home1'
        });

}]); //end routeProvider confg
