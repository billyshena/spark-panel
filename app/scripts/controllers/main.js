'use strict';

/**
 * @ngdoc function
 * @name panelApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the panelApp
 */
angular.module('panelApp')
  .controller('MainCtrl', function ($scope, $http) {
    console.log('MainCtrl');

    $scope.decks = [];

    function loadDecks() {

      $http
        .get(config.appUrl + '/deck')
        .then(function(response) {
          console.log('decks', response);
          $scope.decks = response.data;
        }, function(err) {
          console.log('ok');
        });

    }

    loadDecks();

  });
