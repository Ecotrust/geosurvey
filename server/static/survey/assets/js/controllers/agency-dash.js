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

    $scope.selectYear = function(aclYear) {
      if ($scope.filter.aclYear === aclYear.year) {
        $scope.filter.aclYear = null;
        $scope.filter.startDate = $scope.startDate;
        $scope.filter.endDate = $scope.endDate;
      } else {
        $scope.filter.aclYear = aclYear.year;
        $scope.filter.startDate = Date.parse("January 1st " + aclYear.year).clearTime();
        $scope.filter.endDate = Date.parse("January 1st " + aclYear.year).clearTime().add(365).days();
      }

    };

    $scope.selectCategory = function(category) {
      if ($scope.filter.category === category) {
        $scope.filter.category = null;
      } else {
        $scope.filter.category = category;
      }
    };

    $scope.selectSeries = function(series) {
      series.active = !series.active;
      if (series.all) {
        _.each($scope.chart.series, function(s) {
          if (!s.all) {
            s.active = false;
          }
        })
      } else {
        _.findWhere($scope.chart.series, {
          all: true
        }).active = false;
      }

    };

    $scope.getRandom = function(max) {
      return _.random(1, max || 30);
    }

    $scope.aclYears = [{
      year: 2013
    }, {
      year: 2012
    }, {
      year: 2011
    }]

    $scope.getGearTypes = function () {
      return [
        { type: "Hook and Line or Rod and Reel", value: $scope.getRandom(20) },
        { type: "Lobster Traps", value: $scope.getRandom(20) },
        { type: "Fish Traps", value: $scope.getRandom(20) },
        { type: "Nets", value: $scope.getRandom(20) },
        { type: "Spear or By Hand", value: $scope.getRandom(20) }
      ]
    };



    $scope.chart = {
      title: "ACL By Species",
      categories: [{
        name: "Butterfish (Coney)",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Cabrilla (Red Hind)",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Misty",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Tiger",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Yellowfin",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Blackfin",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Cardinal",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Dogtooth (Schoolmaster)",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Lane",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Queen",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Silk",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Vermillion",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Virgin (Mutton)",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Wenchman",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: 'Yellowtail',
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Bar Jack",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Blue Runner",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Horse Eye",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Margate",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Lionfish",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Bigeye Tuna",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Blackfin Tuna",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Cero Mackerel",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Dolphin (Mahi)",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "King Mackerel",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "LIttle Tunny (bonito)",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Skipjack Tuna",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Swordfish",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Wahoo",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Yellowfin Tuna",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Great Hammerhead",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Scalloped Hammerhead",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }, {
        name: "Tiger",
        data: [$scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20), $scope.getRandom(20)],
        total: $scope.getRandom(3000),
        gearTypes: $scope.getGearTypes()
      }],
      series: [{
        name: 'Region',
        class: 'bar-warning',
        data: [3, 4, 4, 2, 5],
        all: true,
        active: true
      }, {
        name: 'St. Croix',
        class: 'bar-info',
        data: [3, 4, 4, 2, 5]
      }, {
        name: 'St. Johns/St. Thomas',
        class: 'bar-danger',
        data: [3, 4, 4, 2, 5]
      }, {
        name: 'Puerto Rico',
        class: 'bar-success',
        data: [5, 3, 4, 7, 2]
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