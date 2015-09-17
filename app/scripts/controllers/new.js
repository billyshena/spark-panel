'use strict';

/**
 * @ngdoc function
 * @name panelApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the panelApp
 */
angular.module('panelApp')
  .controller('NewCtrl', function ($scope, $http, Upload, $timeout) {

    console.log('NewCtrl', Upload);


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


    $scope.createDeck = function(file) {
        console.log($scope.deck)

      console.log('create Deck file', file);
      file.upload = Upload.upload({
        url: 'http://spark-panel.s3-website-us-east-1.amazonaws.com/',
        method: 'POST',
        headers: {
          'my-header': 'my-header-value'
        },
        fields: {
          key: file.name, // the key to store the file on S3, could be file name or customized
          AWSAccessKeyId: config.assetsUrl,
          acl: 'public-read', // sets the access to the uploaded file in the bucket: private or public
          policy: $scope.policy, // base64-encoded json policy (see article below)
          signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
          "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
          filename: file.name // this is needed for Flash polyfill IE8-9
        },
        file: file,
        fileFormDataName: 'myFile'
      });


      file.upload.then(function (response) {
        console.log('upload then', response);
        $timeout(function () {
          file.result = response.data;
        });
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      });


      file.upload.progress(function (evt) {
        console.log('progressing');
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });


        // Deck object first
        $http
            .post(config.appUrl + '/deck', {
                name: $scope.deck.name,
                description: $scope.deck.description
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
    }
  });
