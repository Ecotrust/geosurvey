//'use strict';
var app = {};

angular.module('askApp', ['ui', 'ui.bootstrap', 'ngGrid'])
    .config(function($routeProvider, $httpProvider) {

    // var initialHeight = $(window).height();
    // $('html').css({ 'min-height': initialHeight});
    // $('body').css({ 'min-height': initialHeight});
    $('#app_shell').height($('body').height()).backstretch('assets/img/splash.png');
    if (localStorage.getItem('hapifis') && window.location.pathname !== '/respond') {
        app.username = JSON.parse(localStorage.getItem('hapifis')).currentUser;
        app.key = localStorage.getItem('hapifis-' + app.username);
        if (localStorage.getItem('hapifis-' + app.username)) {
            app = JSON.parse(localStorage.getItem('hapifis-' + app.username));
        }
    } else {
        
    }

    if (_.string.startsWith(window.location.protocol, "http")) {
        app.server = window.location.protocol + "//" + window.location.host;
    } else {
        app.server = "APP_SERVER";
    }

    app.version = "APP_VERSION";

    app.stage = "APP_STAGE";

    if (window.location.pathname === '/respond') {
        app.viewPath = app.server + '/static/survey/';
        app.offline = false;
    } else {
        app.viewPath = '';
        app.offline = true;
    }

    if (typeof token != 'undefined') {
        $httpProvider.defaults.headers.post['X-CSRFToken'] = token;
    }

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $routeProvider.when('/', {
        templateUrl: app.viewPath + 'views/splash.html',
        controller: 'SplashCtrl'
    })
    .when('/signup', {
            templateUrl: app.viewPath + 'views/signup.html',
            controller: 'MainCtrl'
        })
    .when('/signin', {
            templateUrl: app.viewPath + 'views/signin.html',
            controller: 'MainCtrl'
        })
    .when('/main', {
            templateUrl: app.viewPath + 'views/main.html',
            controller: 'MainCtrl',
            reloadOnSearch: false
        })
        .when('/author/:surveySlug', {
        templateUrl: app.viewPath + 'views/author.html',
        controller: 'AuthorCtrl'
    })
        .when('/surveys', {
        templateUrl: app.viewPath + 'views/SurveyList.html',
        controller: 'SurveyListCtrl'
    })

        .when('/survey/:surveySlug/complete/:uuidSlug', {
        templateUrl: app.viewPath + 'views/complete.html',
        controller: 'CompleteCtrl'
    })
        .when('/survey/:surveySlug/complete/:uuidSlug/:action/:questionSlug', {
        templateUrl: app.viewPath + 'views/complete.html',
        controller: 'CompleteCtrl'
    })
        .when('/survey/:surveySlug/:pageID/:uuidSlug/landing', {
        templateUrl: app.viewPath + 'views/landing.html',
        controller: 'SurveyDetailCtrl'
    })
        .when('/survey/:surveySlug/:pageID/:uuidSlug', {
        templateUrl: app.viewPath + 'views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl'
    })
        .when('/survey/:surveySlug/:questionSlug/:uuidSlug/:action', {
        templateUrl: app.viewPath + 'views/SurveyDetail.html',
        controller: 'SurveyDetailCtrl',
        edit: true
    })
    //     .when('/respondents', {
    //     templateUrl: app.viewPath + 'views/offlineRespondantList.html',
    //     controller: 'offlineRespondantListCtrl'
    // })
        .when('/history', {
        templateUrl: app.viewPath + 'views/history.html',
        controller: 'HistoryCtrl'
    })
        .when('/fisher-summary', {
        templateUrl: app.viewPath + 'views/fisher-summary.html',
        controller: 'SummaryCtrl'
    })
        .when('/unSubmittedSurveyList', {
        templateUrl: app.viewPath + 'views/unSubmittedSurveyList.html',
        controller: 'unSubmittedSurveyListCtrl'
    })
        .when('/submittedSurveyList', {
        templateUrl: app.viewPath + 'views/submittedSurveyList.html',
        controller: 'submittedSurveyListCtrl'
    })
        .when('/respondent/:uuidSlug', {
        templateUrl: app.viewPath + 'views/completedSurveys.html',
        controller: 'offlineRespondantListCtrl'
    })
        .when('/RespondantList/:surveySlug', {
        templateUrl: app.viewPath + 'views/RespondantList.html',
        controller: 'RespondantListCtrl'
    })
        .when('/RespondantDetail/:surveySlug/:uuidSlug', {
        templateUrl: app.viewPath + 'views/RespondantDetail.html',
        controller: 'RespondantDetailCtrl'
    })
        .when('/survey', {
        templateUrl: app.viewPath + 'views/survey.html',
        controller: 'SurveyCtrl'
    })
        .when('/profile', {
        templateUrl: app.viewPath + 'views/profile.html',
        controller: 'ProfileCtrl'
    })
        .when('/settings', {
        templateUrl: app.viewPath + 'views/settings.html',
        controller: 'SettingsCtrl'
    })
        .otherwise({
        redirectTo: '/'
    });
});


$(document).ready(function () {
    $(document).on('focusin touchstart', '.question input, .question select', function (e) { 
        var $this = $(this),
            $wrapper = $this.closest('.question-wrapper');
            // && ! $wrapper.hasClass('grid-question')
        if ($this.closest('.menu-page').hasClass('profile')) {
            return true;
        }
        if ($wrapper.length) {
            if (! $wrapper.hasClass('non-focus-question')) {
                $('body').addClass("keyboard-open");    
                $wrapper.addClass('active');
                if (e.type === 'touchstart') {
                    $this.focus();    
                }    
            } else {
                $('body').addClass("grid-keyboard-open");    
            }
            
            
        }
    });
    
    $(document).on('blur', '.question input, .question select', function (e) { 
        var $this = $(this);
        $('body').removeClass("keyboard-open");
        $('body').removeClass("grid-keyboard-open");
        $this.closest('.question-wrapper').removeClass('active');
    });        
});
