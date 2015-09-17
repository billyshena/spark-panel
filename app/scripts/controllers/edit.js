'use strict';

/**
* @ngdoc function
* @name panelApp.controller:AboutCtrl
* @description
* # AboutCtrl
* Controller of the panelApp
*/
angular.module('panelApp')
.controller('EditCtrl', function ($scope, $http, $route) {

    $scope.questionToUpdate = null;

    $http
    .get(config.appUrl + '/deck/' + $route.current.params.id)
    .then(function(response) {
        $scope.deck = response.data;


        function loadChoices(i) {

            if(i < $scope.deck.questions.length && ($scope.deck.questions[i].type == 'CHECKBOX' ||  $scope.deck.questions[i].type == 'RADIO')) {

                $http
                .get(config.appUrl + '/question/' + $scope.deck.questions[i].id)
                .then(function(response) {

                    console.log(response.data)
                    $scope.deck.questions[i] = response.data;
                    $scope.deck.questions[i].type = {
                        name: $scope.deck.questions[i].type
                    }
                    loadChoices(i + 1);
                })
            }
            else if(i < $scope.deck.questions.length) {
                $scope.deck.questions[i].type = {
                    name: $scope.deck.questions[i].type
                }
            }
        }

        loadChoices(0);
    }, function(err) {
        console.log(err);
    })


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

    $http
    .get(config.appUrl + '/category')
    .then(function(response) {
        $scope.categories = response.data;
    })

    $scope.new = {
        type: $scope.types[0]
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
        });
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
        if(!$scope.deck.questions[index].id) {
            return $scope.deck.questions.splice(index, 1);
        }
        $http
        .delete(config.appUrl + '/question/' + $scope.deck.questions[index].id)
        .then(function(response) {
            $scope.deck.questions.splice(index, 1);
        });
    }

    $scope.updateQuestion = function(index) {

        $scope.questionToUpdate = index;

        var question = $scope.deck.questions[index];

        if(!question.id) {
            return $scope.createQuestion(index);
        }

        $http
        .put(config.appUrl + '/question/' + question.id, {
            title: question.title,
            subtitle: question.subtitle,
            category: question.category.id,
            type: $scope.deck.questions[index].type.name
        })
        .then(function(response) {

            if(question.type.name == 'CHECKBOX' || question.type.name == 'RADIO') {
                console.log('need to update choices', response.data.id)

                // Removing old choices

                $http
                .delete(config.appUrl + '/choice?question=' + response.data.id)
                .then(function() {

                    // Creating new choices

                    function createAnswer(j) {

                        if(j < question.choices.length) {
                            $http
                            .post(config.appUrl + '/choice', {
                                content: question.choices[j].content,
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
                    }

                    createAnswer(0);
                    console.log('question updated');
                    $scope.questionToUpdate = null;
                }, function(err) {
                    console.log(err);
                })
            }
            else {
                console.log('question updated');
                $scope.questionToUpdate = null;
            }
        })
    };


    $scope.updateDeck = function() {
        console.log('changing...' + $scope.deck.id)
        $http
        .put(config.appUrl + '/deck/' + $scope.deck.id, {
            name: $scope.deck.name,
            description: $scope.deck.description
            // TODO: add picture here
        })
        .then(function(response) {
            console.log('UPDATED')
            console.log(response)
        }, function(err) {
            console.log(err);
        })
    }


    $scope.createQuestion = function(i) {
        $http
        .post(config.appUrl + '/question', {
            title: $scope.deck.questions[i].title,
            subtitle: $scope.deck.questions[i].subtitle,
            category: $scope.deck.questions[i].category.id,
            number: i + 1,
            type: $scope.deck.questions[i].type.name,
            deck: $scope.deck.id
        })
        .then(function(response) {

            console.log(response.data)
            $scope.deck.questions[i].id = response.data.id;

            function createAnswer(j) {

                if(j < $scope.deck.questions[i].choices.length && $scope.deck.questions[i].choices[j].content != '') {
                    $http
                    .post(config.appUrl + '/choice', {
                        content: $scope.deck.questions[i].choices[j].content,
                        question: response.data.id
                    })
                    .then(function(response) {
                        console.log('Choice', response.data);
                        createAnswer(j + 1);
                    }, function(err) {
                        console.log(err);
                        createAnswer(j + 1);
                    })
                }
            }

            createAnswer(0);
            $scope.questionToUpdate = null;

            console.log('question created')

        });
    }
});
