// //'use strict';

// angular.module('askApp')
//   .controller('CompleteCtrl', function ($scope, $routeParams, $http) {
//     var url = '/respond/complete/' + [$routeParams.surveySlug, $routeParams.uuidSlug].join('/');

//     if (app.user) {
//         $scope.user = app.user;
//     } else {
//         $scope.user = false;
//     }
//     $scope.path = false;

    
//     if ($routeParams.action === 'terminate' && $routeParams.questionSlug) {
//         url = [url, 'terminate', $routeParams.questionSlug].join('/');
//     }

//     if (app.surveys) {
//         $scope.surveys = app.surveys;
//     }
//     $scope.survey = _.findWhere($scope.surveys, { slug: $routeParams.surveySlug});
    
//     if (app.offline) {
//         app.respondents[$routeParams.uuidSlug].complete = true;
//         app.respondents[$routeParams.uuidSlug].status = 'complete';
//     } else {
//         $http.post(url).success(function (data) {
//             app.data.state = $routeParams.action;
//         });    
//     }
    
    
//     if (app.data) {
//         $scope.responses =app.data.responses;    
//         app.data.responses = [];
//     }
//     $scope.completeView = '/static/survey/survey-pages/' + $routeParams.surveySlug + '/complete.html';
//   });
