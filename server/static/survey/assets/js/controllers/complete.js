//'use strict';

angular.module('askApp')
  .controller('CompleteCtrl', function ($scope, $routeParams, $http, $location, survey) {
    var url = '/respond/complete/' + [$routeParams.surveySlug, $routeParams.uuidSlug].join('/');
    $http.defaults.headers.post['Content-Type'] = 'application/json';


    $scope.sendRespondent = function (respondent) {
        var url = app.server + '/api/v1/offlinerespondant/';
        var responses = angular.copy(respondent.responses);
        _.each(responses, function (response) {
            var question_uri = response.question.resource_uri;
            response.question = question_uri;
            response.answer_raw = JSON.stringify(response.answer);
        });
        var newRespondent = {
            ts: respondent.ts,
            uuid: respondent.uuid.replace(':', '_'),
            responses: responses,
            status: respondent.status,
            complete: respondent.complete,
            survey: '/api/v1/survey/' + respondent.survey + '/'
        };
        return $http.post(url, newRespondent).error(function (err) {
            console.log(JSON.stringify(err));
        });
        
    }   


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
        app.message = "You have completed a catch report."
        localStorage.setItem('hapifish', JSON.stringify(app));    
    } else {
        $http.post(url).success(function (data) {
            app.data.state = $routeParams.action;
        });    
    }
    
    
    if (app.data) {
        $scope.responses =app.data.responses;    
        app.data.responses = [];
    }
    $scope.completeView = '/static/survey/survey-pages/' + $routeParams.surveySlug + '/complete.html';

    $scope.submitReport = function () {
        $scope.working = true;
        var newRespondent = app.respondents[$routeParams.uuidSlug];
        
        //verify report (delete any necessary questions) 
        // call function within survey service...
        var answers = _.indexBy(newRespondent.responses, function(item) {
            return item.question;
        });

        //clean survey of any unncecessary question/answers 
        survey.initializeSurvey($scope.survey, null, answers);
        newRespondent.responses = survey.cleanSurvey(newRespondent);
        
        $scope.sendRespondent(newRespondent).success(function () {
            
            delete app.user.resumePath;
            delete app.respondents[$routeParams.uuidSlug]
            app.message = "You catch report was successfully submitted."
            localStorage.setItem('hapifish', JSON.stringify(app));
            $location.path('#/');
            $scope.working = true;
        }).error(function () {
            app.message = "You catch report was saved and can be submitted later."
            localStorage.setItem('hapifish', JSON.stringify(app));
            $location.path('#/');
        });

    };
    
  });
