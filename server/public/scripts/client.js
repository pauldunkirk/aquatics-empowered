var myApp = angular.module('myApp', ['ui.router','ui.bootstrap']);
// var myApp = angular.module('myApp', ['ui.router','ui.bootstrap','ngAnimate', 'ngTouch', 'ngFader']);


// eventually separate routing (config) from app module (client) like in IIMN

// IIMN client:  var app = angular.module('fhatApp', ['ngMaterial','ui.router','firebase','chart.js', 'cfp.hotkeys'])
// IIMN config:  app.config(function($stateProvider,$urlRouterProvider) {
//   var main = {
//   //   name: 'main',
//   //   url: '/main',
//   //   controller: 'MainStateController',
//   //   controllerAs: 'msc',
//   //   templateUrl: '/views/mainstate.html'
//   //
// };
// $stateProvider.state(profilequestions);
// //   ETC..
//
// //   $urlRouterProvider.when('', '/login');
// });




//   IIMN APP
// app.config(function($stateProvider,$urlRouterProvider) {
//   var main = {
//     name: 'main',
//     url: '/main',
//     controller: 'MainStateController',
//     controllerAs: 'msc',
//     templateUrl: '/views/mainstate.html'
//   };
//   var login = {
//     name: 'login',
//     url: '/login',
//     controller: 'LoginController',
//     controllerAs: 'lc',
//     templateUrl:'/views/login.html'
//   };
//   var mainState = {
//     name: 'main',
//     url: '/main',
//     controlller: 'MainController',
//     controllerAs: 'mc',
//     templateUrl: '/views/mainstate.html'
//   };
//   ETC..
//   BELOW NO URL SPECIFIED - CHILDREN OF MAIN - MAIN.something
//   var budget = {
//     name: 'main.budget',
//     controller: 'BudgetController',
//     controllerAs: 'bc',
//     templateUrl:'/views/budget.html'
//   };
//   var budgetIncome = {
//     name: 'main.budget.income',
//     controller: 'BudgetController',
//     controllerAs: 'bc',
//     templateUrl:'/views/budgetincome.html'
//   };
//   ETC..
//
//   $stateProvider.state(login);
//   $stateProvider.state(main);
//   $stateProvider.state(welcome);
//   $stateProvider.state(balanceSheet);
//   $stateProvider.state(balanceSheetAssets);
//   $stateProvider.state(profilequestions);
//   ETC..

//   $urlRouterProvider.when('', '/login');
// }); END IIMN APP




// BIGTOE APP
// myApp.config(['$routeProvider', function($routeProvider) {
//     $routeProvider
//         .when ('/login', {
//           templateUrl: '/views/login.html',
//           controller: 'LoginController',
//           controllerAs: 'login'
//         }).when ('/requests', {
//             templateUrl: '/views/requests.html',
//             controller: 'LoginController',
//             controllerAs: 'requests'
//         }).when ('/gigs', {
//             templateUrl: '/views/gigs.html',
//             controller: 'GigsController',
//             controllerAs: 'gigs'
//         }).when ('/players', {
//             templateUrl: '/views/players.html',
//             controller: 'GigsController',
//             controllerAs: 'players'
//         }).when ('/mp3s', {
//             templateUrl: '/views/mp3s.html',
//             controller: 'mp3sController',
//             controllerAs: 'mp3s'
//         }).when ('/charts', {
//             templateUrl: '/views/charts.html',
//             controller: 'ChartsController',
//             controllerAs: 'charts'
//         }).when ('/contacts', {
//             templateUrl: '/views/contacts.html',
//             controller: 'ContactsController',
//             controllerAs: 'contacts'
//         }).when ('/setlists', {
//             templateUrl: '/views/setlists.html',
//             controller: 'SetlistsController',
//             controllerAs: 'setlists'
//         }).when ('/video', {
//             templateUrl: '/views/video.html',
//             controller: 'VideoController',
//             controllerAs: 'video'
//         }).otherwise ({
//             redirectTo: '/login'
//         });
//
// }]); //end routeProvider confg BIG token




// OLD AQUATICS APP
// routing
// angular.module("aquaticsApp")
//   .config(function($routeProvider, $locationProvider) {
//     $locationProvider.html5Mode(true);
//
//     $routeProvider
//       .when("/newUser", {
//         templateUrl: "views/register.html",
//         controller: "RegisterController as register"
//       })
//       .when("/admin", {
//         templateUrl: "views/admin.html",
//         controller: "AdminController as admin"
//       })
//       .when("/login", {
//         templateUrl: "views/login.html",
//         controller: "LoginController as login"
//     })
//       .when("/facilitydetails", {
//         templateUrl: "views/facilitydetails.html",
//         controller: "FacilityDetailsController as facilitydetails"
//       })
//       .when("/profile", {
//         templateUrl: "views/profileView.html",
//         controller: "userProfileController as user"
//       })
//       .otherwise( {
//         templateUrl: "views/home.html",
//         controller: "HomeController as home",
//         //authRequired: true
//       });
//   });
  // .run(function($rootScope, $location, $route, AuthService) {
  //   $rootScope.$on("$routeChangeStart", function(event, next, current) {
  //     AuthService.checkLoginStatus().then(function(loggedIn) {
  //       console.log(loggedIn);
  //       if (next.authRequired && !loggedIn) {
  //         $location.path("/login");
  //         $route.reload();
  //       }
  //     });
  //   });
  // });  END AQUATICS APP



//
