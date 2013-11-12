//'use strict';

angular.module('askApp')
  .controller('CompleteCtrl', function ($scope, $routeParams, $http, $location, survey, history, storage) {
    var url = '/respond/complete/' + [$routeParams.surveySlug, $routeParams.uuidSlug].join('/');
    $http.defaults.headers.post['Content-Type'] = 'application/json';

   
    if (app.user) {
        $scope.user = app.user;
    } else {
        $scope.user = false;
    }
    $scope.path = false;

    
    if ($routeParams.action === 'terminate' && $routeParams.questionSlug) {
        url = [url, 'terminate', $routeParams.questionSlug].join('/');
    }

    if (app.surveys) {
        $scope.surveys = app.surveys;
    }
    $scope.survey = _.findWhere($scope.surveys, { slug: $routeParams.surveySlug});
    if (app.offline) {
        app.respondents[$routeParams.uuidSlug].complete = true;
        app.respondents[$routeParams.uuidSlug].status = 'complete';
        delete app.user.resumePath;
        app.message = "You have completed a catch report.";

        storage.saveState(app);       
    } else {
        $http.post(url).success(function (data) {
            app.data.state = $routeParams.action;
        });    
    }

    $scope.respondent = app.respondents[$routeParams.uuidSlug];
    
    
    if (app.data) {
        $scope.responses =app.data.responses;    
        app.data.responses = [];
    }
    $scope.completeView = '/static/survey/survey-pages/' + $routeParams.surveySlug + '/complete.html';



    $scope.skipBack = function () {
        var lastPage = survey.getLastPage();
        if (lastPage) {
            $location.path(['survey', $routeParams.surveySlug, lastPage.order, $routeParams.uuidSlug].join('/'));    
        } else {
            $location.path('/surveys');
        }

    };

    $scope.getTitle = function() {
        return history.getTitle($scope.respondent);
    };

    $scope.getAnswer = function(questionSlug) {
        return history.getAnswer(questionSlug, $scope.respondent);
    };

    $scope.submitReport = function () {
        $scope.working = true;
        var newRespondent = app.respondents[$routeParams.uuidSlug];
        
        delete app.user.resumePath;
        survey.submitSurvey(newRespondent, $scope.survey).success(function () {
            delete app.respondents[$routeParams.uuidSlug]
            app.message = "You catch report was submitted successfully."
            storage.saveState(app);
            $location.path('/main');
            $scope.working = true;
        }).error(function () {
            app.message = "You catch report was saved and can be submitted later."
            storage.saveState(app);
            $location.path('/main');
        });

    };

    $scope.continueOffline = function () {
        app.message = "You catch report was saved and can be submitted later."
        delete app.user.resumePath;
        storage.saveState(app);
        $location.path('/main');
    }   
    
  });
