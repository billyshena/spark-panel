'use strict';

/**
 * @ngdoc function
 * @name panelApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the panelApp
 */
angular.module('panelApp')
  .controller('NewCtrl', function ($scope, $http, $timeout, FileUploader) {


    $scope.disabled = false;
    $scope.item = {};
    $scope.types = [{
            name: 'RADIO'
        }, {
            name: 'CHECKBOX'
        }, {
            name: 'TEXTAREA'
        }, {
            name: 'INPUT'
        }, {
            name: 'DUO'
        }];


    // FileUploader
    var uploader = $scope.uploader = new FileUploader({
      method: 'PUT',
      queueLimit: 1
    });


    uploader.onAfterAddingFile = function(fileItem){
      console.log('adding file', fileItem);
      $scope.item = fileItem;
    };

    uploader.onCompleteItem = function(fileItem){
      $http
        .post(config.appUrl + '/deck', {
          name: $scope.deck.name,
          description: $scope.deck.description,
          picture: config.assetsUrl + '/' + fileItem.keyName
        })
        .then(function(response) {

          var deck = response.data;
          var question;

          function createQuestion(i) {



            function createAnswer(j) {

              if(j < $scope.deck.questions[i].choices.length) {
                $http
                  .post(config.appUrl + '/choice', {
                    content: $scope.deck.questions[i].choices[j].content,
                    question: question.id
                  })
                  .then(function(response) {
                    console.log('Choice', response.data);
                    createAnswer(j + 1);
                  }, function(err) {
                    console.log(err);
                    createAnswer(j + 1);
                  })
              }
              else {
                createQuestion(i + 1);
              }
            }

            if(i < $scope.deck.questions.length) {

              $http
                .post(config.appUrl + '/question', {
                  title: $scope.deck.questions[i].title,
                  subtitle: $scope.deck.questions[i].subtitle,
                  number: i + 1,
                  type: $scope.deck.questions[i].type.name,
                  deck: deck.id
                })
                .then(function(response) {
                  console.log('Question: ', response.data)
                  question = response.data;

                  if($scope.deck.questions[i].type.name == 'RADIO' || $scope.deck.questions[i].type.name == 'CHECKBOX') {
                    createAnswer(0);
                  }
                  else {
                    createQuestion(i + 1);
                  }
                }, function(err) {
                  console.log(err);
                  createQuestion(i + 1);
                })
            }
          }


          createQuestion(0);


        }, function(err) {
          console.log(err);
        })
    };


    uploader.onErrorItem = function(item, response, status, headers){
      console.log(response);
    };


    $scope.deck = {
        name: '',
        description: '',
        questions: []
    }

    $scope.new = {
        type: ''
    }


    $scope.addQuestion = function() {
        $scope.deck.questions.push({
            type: $scope.new.type,
            title: '',
            subtitle: '',
            choices: [{
                    content: ''
                }, {
                    content: ''
                }, {
                    content: ''
                }]
        })
    }

    $scope.addChoice = function(question) {
        question.choices.push({
            content: ''
        })
    }

    $scope.removeChoice = function(question, index) {
        question.choices.splice(index, 1);
    }

    $scope.removeQuestion = function(index) {
        $scope.deck.questions.splice(index, 1);
    }


    $scope.createDeck = function() {

      var file = $scope.item.file;
      $scope.disabled = true;
      $http
        .post(config.appUrl + '/deck/upload', {
          extension: file.name.split('.').pop()
        })
        .then(function(response) {
          $scope.item.url = response.data.signedUrl;
          $scope.item.keyName = response.data.keyName;
          $scope.item.headers = {
            'Content-Type': $scope.item.file.type != '' ? $scope.item.file.type : 'application/octet-stream'
          };
          $scope.item.upload();
        });
        // Deck object first

    }
  });
