// create angular module for dashApp
var dashApp = angular.module('dashApp', ['ngRoute']);

// manage routing and controllers
dashApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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
}]);

// listCtrl
dashApp.controller('listCtrl', ['$scope','$http', function($scope, $http) {
    $http.get('../spdx.json').success( function(data, status, headers, config) {
        $scope.docs = data;
    });
}]);

// docCtrl
dashApp.controller('docCtrl', ['$scope', function($scope) {	
}]);

