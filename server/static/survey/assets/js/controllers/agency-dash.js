//'use strict';

angular.module('askApp')
    .controller('AgencyDashCtrl', function($scope, $http, $routeParams) {
        
        $scope.startDate = Date.today().add(-365 * 5).days();
        $scope.endDate = Date.today();

        $scope.filter = {
          endDate: $scope.endDate,
          startDate: $scope.startDate,
          category: null,
          name: null,
          aclYear: null
        }

        $scope.selectYear = function (aclYear) {
          if ($scope.filter.aclYear === aclYear.year) {
            $scope.filter.aclYear = null;
            $scope.filter.startDate = $scope.startDate;
            $scope.filter.endDate = $scope.endDate;
          } else {
            $scope.filter.aclYear = aclYear.year;  
            $scope.filter.startDate = Date.parse("January 1st " + aclYear.year).clearTime();
            $scope.filter.endDate = Date.parse("January 1st " + aclYear.year).add(365).days().clearTime();
          }
          
        };

        $scope.selectCategory = function (category) {
          if ($scope.filter.category === category) {
            $scope.filter.category = null;
          } else {
            $scope.filter.category = category;
          }
        };

        $scope.selectSeries = function (series) {
          series.active = ! series.active;
          if (series.all) {
            _.each($scope.chart.series, function (s) {
              if (! s.all) {
                s.active = false;  
              }
            })
          } else {
            _.findWhere($scope.chart.series, { all: true }).active = false;
          }

        };
        
        $scope.aclYears = [
          { year: 2013 },
          { year: 2012 },
          { year: 2011 }
        ]

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
                name: 'Region',
                class: 'bar-warning',
                data: [3, 4, 4, 2, 5],
                all: true,
                active: true
            },
            {
                name: 'St. Croix',
                class: 'bar-info',
                data: [3, 4, 4, 2, 5]
            },
            {
                name: 'St. Johns/St. Thomas',
                class: 'bar-danger',
                data: [3, 4, 4, 2, 5]
            },
            {
                name: 'Puerto Rico',
                class: 'bar-success',
                data: [5, 3, 4, 7, 2]
            }]
        }
        $scope.getRandom = function (max) {
          return _.random(1, max || 30);
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
