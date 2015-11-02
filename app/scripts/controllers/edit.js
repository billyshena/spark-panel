'use strict';

/**
* @ngdoc function
* @name panelApp.controller:AboutCtrl
* @description
* # AboutCtrl
* Controller of the panelApp
*/
angular.module('panelApp')
.controller('EditCtrl', function ($scope, $http, $route, $location, FileUploader) {

    $scope.questionToUpdate = null;
    $scope.saving = false;

    $http
    .get(config.appUrl + '/deck/' + $route.current.params.id)
    .then(function(response) {
        $scope.deck = response.data;


        $http
        .get(config.appUrl + '/question?where={"deck":' + $scope.deck.id + '}&sort=number')
        .then(function(response) {
            $scope.deck.questions = response.data;

            for(var i=0; i<$scope.deck.questions.length; i++) {
                $scope.deck.questions[i].type = {
                    name: $scope.deck.questions[i].type
                }
            }

            console.log($scope.deck.questions)
        }, function(err) {
            console.log(err);
        })
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

    $scope.deleteDeck = function() {
        if (confirm('Are you sure you want to remove the deck?')) {
            // Save it!
            $http
                .delete(config.appUrl + '/deck/' + $scope.deck.id)
                .then(function() {
                    return $location.path('/')
                }, function(err) {
                    console.log(err);
                })
        }
    };


    $scope.addQuestion = function() {

        var question = {
            type: $scope.new.type,
            title: '',
            subtitle: '',
            choices: [{
                content: '',
                picture: ''
            }, {
                content: '',
                picture: ''
            }]
        };

        if(question.type.name == 'RADIO' || question.type.name == 'CHECKBOX') {
            question.choices.push({
                content: ''
            });
        }

        $scope.deck.questions.push(question);
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

        console.log($scope.deck.questions)
        console.log('Index', index, question)

        $http
        .put(config.appUrl + '/question/' + question.id, {
            title: question.title,
            subtitle: question.subtitle,
            points: question.points,
            category: question.category.id,
            number: question.number,
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
            else if(question.type.name == 'DUO') {
                console.log('updating duo question')

                function updateDuoQuestion(i, cb) {
                    if(i < 2) {
                        $http
                            .put(config.appUrl + '/choice/' + question.choices[i].id, {
                                content: question.choices[i].content,
                                picture: question.choices[i].picture
                            })
                            .then(function(response) {
                                console.log('Choice one updated', response);
                                updateDuoQuestion(i + 1, cb);
                            }, function(err) {
                                console.log(err);
                                updateDuoQuestion(i + 1, cb);
                            })
                    }
                    else {
                        cb();
                    }
                }

                updateDuoQuestion(0, function() {
                    console.log('question updated');
                    $scope.questionToUpdate = null;
                })
            }
            else {
                console.log('question updated');
                $scope.questionToUpdate = null;
            }
        })
    };


    $scope.updateDeck = function() {
        $scope.saving = true;

        console.log('changing...' + $scope.deck.id)
        $http
        .put(config.appUrl + '/deck/' + $scope.deck.id, {
            name: $scope.deck.name,
            description: $scope.deck.description,
            points: $scope.deck.points
            // TODO: add picture here
        })
        .then(function(response) {
            $scope.saving = false;
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
            points: $scope.deck.questions[i].points,
            number: i + 1,
            type: $scope.deck.questions[i].type.name,
            deck: $scope.deck.id
        })
        .then(function(response) {

            console.log(response.data)
            $scope.deck.questions[i].id = response.data.id;

            function createAnswer(j) {

                console.log('Question', $scope.deck.questions[i]);

                if(j < $scope.deck.questions[i].choices.length && ($scope.deck.questions[i].type.name == 'DUO' || $scope.deck.questions[i].choices[j].content != '')) {
                    $http
                    .post(config.appUrl + '/choice', {
                        content: $scope.deck.questions[i].choices[j].content,
                        question: response.data.id,
                        picture: $scope.deck.questions[i].choices[j].picture
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


    // FileUPLOADER FOR DUO QUESTION
    var duoUploader = $scope.duoUploader = new FileUploader({
        method: 'PUT',
        queueLimit: 1
    });

    duoUploader.onErrorItem = function(item, response, status, headers){
        console.log(response);
    };

    duoUploader.onAfterAddingFile = function(fileItem){
        console.log('adding file', fileItem);

        $http
            .post(config.appUrl + '/choice/upload', {
                extension: fileItem.file.name.split('.').pop()
            })
            .then(function(response) {
                console.log(response);
                fileItem.url = response.data.signedUrl;
                fileItem.keyName = response.data.keyName;
                fileItem.headers = {
                    'Content-Type': fileItem.file.type != '' ? fileItem.file.type : 'application/octet-stream'
                };
                fileItem.upload();
            });

    };

    duoUploader.onCompleteItem = function(fileItem){
        fileItem.choice.picture = config.assetsUrl + '/' + fileItem.keyName;
        fileItem.remove();

        console.log('Completed',fileItem.choice);
    };
});
