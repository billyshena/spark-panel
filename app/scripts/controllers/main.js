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
            $scope.decks = response.data;
        }, function(err) {
            console.log(err);
        });

    }


    // Remove deck from scope
    function removeDeck(deck) {

      for(var i = 0 ; i < $scope.decks.length ; i++) {
        if($scope.decks[i].id == deck.id) {
          $scope.decks.splice(i, 1);
          break;
        }
      }

    }

    // Function to delete a Deck
    $scope.delete = function(deck) {
      console.log('deleting...');
      var txt;
      var r = confirm("Are you sure you want to delete " + "'" + deck.name + "' deck ?" );
      if (r == true) {
        $http
          .delete(config.appUrl + '/deck/' + deck.id)
          .then(function(response) {
            removeDeck(response.data);
          }, function(err) {
            return console.log(err);
          });
      }
    };

    loadDecks();

});
