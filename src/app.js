// create angular module for dashApp
var dashApp = angular.module('dashApp', ['ngRoute', 'ngResource']);

// manage routing and controllers
dashApp.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
    // set up routes
    $routeProvider
        .when('/', {
            controller: 'listCtrl',
            templateUrl: 'partials/listview.html'
        })
        .when('/doc', {
            controller: 'docCtrl',
            templateUrl: 'partials/docview.html'
        })
        .otherwise({ redirectTo: '/' });

    // send requests with appropriate CORS headers for the whole app
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

// spdxDoc factory for managing getting spdx docs from the server
dashApp.factory('spdxDoc', ['$resource', function($resource) {
    return $resource('spdxdev.ist.unomaha.edu:3000/api/spdx', {}, {
        query: {method:'GET', isArray:true}
    });
}]);

//***************************************************************************
//Controllers
//
//listCtrl - Controller for dashboard home, gets a list of all SPDX Docs and
//           displays it
//docCtrl - Controller for the single doc view, displays a SPDX doc in html
//          format
//***************************************************************************

// listCtrl
dashApp.controller('listCtrl', ['$scope','spdxDoc', function($scope, spdxDoc) {
   $scope.docs = spdxDoc.query(); 
}]);

// docCtrl
dashApp.controller('docCtrl', ['$scope', function($scope) {	
}]);

