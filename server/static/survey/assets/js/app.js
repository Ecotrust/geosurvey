//'use strict';


var initialHeight = $(window).height();
$('html').css({ 'min-height': initialHeight});
$('body').css({ 'min-height': initialHeight});



if (localStorage.getItem('hapifish') && window.location.pathname !== '/respond') {
    app = JSON.parse(localStorage.getItem('hapifish'));
    console.log(app);
} else {
    var app = {};    
}
if (_.string.startsWith(window.location.protocol, "http")) {
    app.server = window.location.protocol + "//" + window.location.host;
} else {
    app.server = "APP_SERVER";
}

app.version = "APP_VERSION";

if (window.location.pathname === '/respond') {
    app.viewPath = app.server + '/static/survey/';
    app.offline = false;
} else {
    app.viewPath = '';
    app.offline = true;
}
angular.module('askApp', ['ui', 'ui.bootstrap', 'ngGrid'])
    .config(function($routeProvider, $httpProvider) {

    if (typeof token != 'undefined') {
        $httpProvider.defaults.headers.post['X-CSRFToken'] = token;
    }

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $routeProvider.when('/', {
        templateUrl: app.viewPath + 'views/splash.html',
        controller: 'SplashCtrl',
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
        .when('/respondents', {
        templateUrl: app.viewPath + 'views/offlineRespondantList.html',
        controller: 'offlineRespondantListCtrl'
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


// $(document).ready(function () {
//     $('input').live('focus', function (e) { 
//         $('body').addClass("keyboard-open");
//             // window.scrollTo(0,0); //the second 0 marks the Y scroll pos. Setting this to i.e. 100 will push the screen up by 100px.
//     });
//     $('select').live('focus', function (e) { 
//         $('body').addClass("keyboard-open");
//             // window.scrollTo(0,0); //the second 0 marks the Y scroll pos. Setting this to i.e. 100 will push the screen up by 100px.
//     });
//     $('input').live('blur', function (e) {
//         $('body').removeClass("keyboard-open");
//     });        
//     $('select').live('change', function (e) {
//         $('body').removeClass("keyboard-open");
//     });        
// });