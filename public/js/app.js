var app = angular.module('buncisApp', ['buncisApp.services', 'buncisApp.controllers']);

app.config(function ($locationProvider, $routeProvider) {
  // $locationProvider.html5Mode(true);
  $routeProvider
  .when('/',
  {
    controller: 'MainController',
    templateUrl: '/views/features.html'
  })
  .when('/points/:id',
  {
    controller: 'EditController',
    templateUrl: '/views/edit-feature.html'
  })
  .when('/pictures/:id/:filename',
  {
    controller: 'ImageController',
    templateUrl: '/views/edit-image.html'
  })
  .otherwise({ redirectTo: '/'});
})