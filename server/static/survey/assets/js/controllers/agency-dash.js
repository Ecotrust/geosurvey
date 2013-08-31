//'use strict';

angular.module('askApp')
    .controller('AgencyDashCtrl', function($scope, $http, $routeParams) {
        
        $scope.filter = {
          endDate: Date.today(),
          startDate: Date.today().add(-365).days(),
          category: null,
          name: null
        }

        $scope.selectCategory = function (category) {
          if ($scope.filter.category === category) {
            $scope.filter.category = null;
          } else {
            $scope.filter.category = category;
          }
        };

        $scope.selectSeries = function (series) {
          if ($scope.filter.name === series.name) {
            $scope.filter.name = null;
          } else {
            $scope.filter.name = series.name;
          }
        };
        $scope.gearType = {
          'St. Croix': {

          },
          'St. Thomas': {

          },
          'St. John': {
            
          }
        }


        $scope.chart = {
            title: "ACL By Species",
            categories: [
              "Butterfish (Coney)",
              "Cabrilla (Red Hind)",
              "Misty",
              "Tiger",
              "Yellowfin",
              "Blackfin",
              "Cardinal",
              "Dogtooth (Schoolmaster)",
              "Lane",
              "Queen",
              "Silk",
              "Vermillion",
              "Virgin (Mutton)",
              "Wenchman",
              'Yellowtail',
              "Bar Jack",
              "Blue Runner",
              "Horse Eye",
              "Margate",
              "Lionfish",
              "Bigeye Tuna",
              "Blackfin Tuna",
              "Cero Mackerel",
              "Dolphin (Mahi)",
              "King Mackerel",
              "LIttle Tunny (bonito)",
              "Skipjack Tuna",
              "Swordfish",
              "Wahoo",
              "Yellowfin Tuna",
              "Great Hammerhead",
              "Scalloped Hammerhead",
              "Tiger"
            ],
            series: [
            {
                name: 'St. John',
                class: 'bar-success',
                data: [5, 3, 4, 7, 2]
            }, {
                name: 'St. Thomas',
                class: 'bar-info',
                data: [2, 2, 3, 2, 1]
            }, {
                name: 'St. Croix',
                class: 'bar-warning',
                data: [3, 4, 4, 2, 5]
            }]
        }

  //   $http.get('/api/v1/surveyreport/' + $routeParams.surveySlug + '/?format=json').success(function(data) {
  //       data.questions.reverse();
  //       $scope.survey = data;
        

  //       _.each($scope.survey.questions, function (question) {
  //           // save a reference to filter questions which are specified by uri
  //           question.filters = {};
  //           if (question.visualize && question.filter_questions) {
  //               question.filterQuestions = [];
  //               _.each(question.filter_questions, function (filterQuestion) {
  //                   question.filterQuestions.push($scope.getQuestionByUri(filterQuestion));
  //               });

  //           }
  //       });
        

  //   }).success(function() {
  //       $http.get('/api/v1/reportrespondant/?format=json&survey__slug__exact=' + $routeParams.surveySlug).success(function(data) {
  //           $scope.respondents = data.objects;
  //           $scope.meta = data.meta;
  //       });
         
  //   });

  //   $scope.getQuestionByUri = function (uri) {
  //       return _.findWhere($scope.survey.questions, {'resource_uri': uri});
  //   };

  //   $scope.getQuestionBySlug = function (slug) {
		// return _.findWhere($scope.survey.questions, {'slug': slug});
  //   };
});
