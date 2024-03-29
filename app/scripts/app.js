'use strict';

/**
 * @ngdoc overview
 * @name panelApp
 * @description
 * # panelApp
 *
 * Main module of the application.
 */
angular
  .module('panelApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularFileUpload'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/new', {
        templateUrl: 'views/new.html',
        controller: 'NewCtrl'
      })
      .when('/category', {
        templateUrl: 'views/category.html',
        controller: 'CategoryCtrl'
      })
      .when('/edit/:id', {
        templateUrl: 'views/edit.html',
        controller: 'EditCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
