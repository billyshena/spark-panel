'use strict';

/**
 * @ngdoc function
 * @name panelApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the panelApp
 */
angular.module('panelApp')
  .controller('NewCtrl', function ($scope, $http) {

    console.log('NewCtrl');


    $scope.types = [{
            name: '-- Select a question type --'
        }, {
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
        type: $scope.types[0]
    }


    $http
        .get(config.appUrl + '/category')
        .then(function(response) {
            $scope.categories = response.data;
        })

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
        $scope.new.type = $scope.types[0];
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
        console.log($scope.deck)

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

                        if(j < $scope.deck.questions[i].choices.length && $scope.deck.questions[i].choices[j].content != '') {
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
                                category: $scope.deck.questions[i].category.id,
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

                window.location.replace('/');


            }, function(err) {
                console.log(err);
            })
    }
  });
