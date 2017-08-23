var app = angular.module('myApp', ['ngRoute','ui.bootstrap', 'ngMap']);
// ui.bootstrap allows toggleable nav bar to begin collapsed- see nav.html
//possibly in the future, use these tools:
// var myApp = angular.module('myApp', ['ngRoute', 'xeditable', 'firebase', 'ui.bootstrap', 'smart-table', 'angular-touch', 'angular-animate']); //then source in html


app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
   .when('/home1', {
     templateUrl: '/views/home1.html',
     controller: 'Home1Controller',
     controllerAs: 'home1'
 }).when('/home2', {
     templateUrl: '/views/home2.html',
     controller: 'Home2Controller',
     controllerAs: 'home2'
 }).when('/surveys', {
     templateUrl: '/views/surveys.html',
     controller: 'Home1Controller',
     controllerAs: 'home1'
 }).when('/survey-facilities', {
    templateUrl: '/views/survey-facilities.html',
    controller: 'Home1Controller',
    controllerAs: 'home1'
 }).when('/survey-therapists', {
    templateUrl: '/views/survey-therapists.html',
    controller: 'Home1Controller',
    controllerAs: 'home1'
 }).when('/survey-poolusers', {
    templateUrl: '/views/survey-poolusers.html',
    controller: 'Home1Controller',
    controllerAs: 'home1'
 }).when('/maps', {
    templateUrl: '/views/templates/maps.html',
    controller: 'MapsController',
    controllerAs: 'maps'
 }).otherwise({
    redirectTo: '/home1'
 });
}]);
