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
    $scope.points = null;
    $scope.item = {};
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


    // FileUploader for DECK PICTURE

    var uploader = $scope.uploader = new FileUploader({
        method: 'PUT',
        queueLimit: 1
    });

    uploader.onAfterAddingFile = function(fileItem){
        console.log('adding file', fileItem);
        $scope.item = fileItem;
    };

    uploader.onCompleteItem = function(fileItem){
        // Deck object first


        console.log('fileItem', fileItem);
        console.log('premium', $scope.checked);
        console.log('points', $scope.points);
        $http
        .post(config.appUrl + '/deck', {
            name: $scope.deck.name,
            description: $scope.deck.description,
            picture: config.assetsUrl + '/' + fileItem.keyName,
            points: $scope.deck.points
        })
        .then(function(response) {

            var deck = response.data;
            var question;

            function createQuestion(i) {

                function createAnswer(j) {

                    if(j < $scope.deck.questions[i].choices.length && ($scope.deck.questions[i].type.name == 'DUO' || $scope.deck.questions[i].choices[j].content != '')) {
                        $http
                        .post(config.appUrl + '/choice', {
                            content: $scope.deck.questions[i].choices[j].content,
                            picture: $scope.deck.questions[i].choices[j].picture,
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
                        points: $scope.deck.questions[i].points,
                        number: i + 1,
                        type: $scope.deck.questions[i].type.name,
                        deck: deck.id
                    })
                    .then(function(response) {
                        console.log('Question: ', response.data)
                        question = response.data;

                        if($scope.deck.questions[i].type.name == 'RADIO' || $scope.deck.questions[i].type.name == 'CHECKBOX' || $scope.deck.questions[i].type.name == 'DUO') {
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
                else {
                    window.location.replace('/');
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
        $scope.deck.questions.splice(index, 1);
    }


    $scope.createDeck = function() {

        var file = $scope.item.file;
        $scope.disabled = true;

        if(!file || !file.name) {
            $scope.disabled = false;
            return alert('Please attach an image to the deck');
        }

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

    }
});
