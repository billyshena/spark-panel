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

    $scope.decks = [];

    function loadDecks() {

        $http
        .get(config.appUrl + '/deck')
        .then(function(response) {
            console.log('Decks', response.data)
            $scope.decks = response.data;
        }, function(err) {
            console.log(err);
        });

    }

    loadDecks();

});
