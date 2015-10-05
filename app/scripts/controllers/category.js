/**
 * Created by bshen on 08/09/15.
 */
'use strict';

/**
 * @ngdoc function
 * @name panelApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the panelApp
 */
angular.module('panelApp')
  .controller('CategoryCtrl', function ($scope, $http) {

    console.log('CategoryCtrl');
    $scope.category = {};
    $scope.categories = [];


    $scope.create = function() {

      $http
        .post(config.appUrl + '/category', $scope.category)
        .then(function(response) {
          $scope.categories.push(response.data);
        }, function(err) {
          return console.log(err);
        });

    };

    $scope.deleteCategory = function(category) {
        if (confirm('Are you sure you want to remove this category?')) {
            // Save it!
            $http
                .delete(config.appUrl + '/category/' + category.id)
                .then(function() {

                    $scope.categories.splice($scope.categories.indexOf(category), 1);

                }, function(err) {
                    console.log(err);
                })
        }
    };

    function loadCategories() {

      $http
        .get(config.appUrl + '/category')
        .then(function(response) {

          $scope.categories = response.data;
          console.log($scope.categories)

        }, function(err) {
          return console.log(err);
        })

    }

    loadCategories();

  });
