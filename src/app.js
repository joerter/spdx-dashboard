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
        .when('/doc/:id', {
            controller: 'docCtrl',
            templateUrl: 'partials/docview.html'
        })
        .otherwise({ redirectTo: '/' });

    // send requests with appropriate CORS headers for the whole app
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

// factory for helper functions
dashApp.factory('helpers', function() {
    var factory = {};

    factory.findByID = function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id == id) {
                return array[i];
            }
        }
        return null;
    }

    return factory; 
}); 

// spdxDoc factory for managing getting spdx docs from the server
dashApp.factory('spdxDoc', ['$resource', 'helpers', function($resource, helpers) {
    // define the resource object. we can use this to do queries http://spdxdev.ist.unomaha.edu:3000/api/spdx
    var resource = $resource('spdx.json', {}, {
        getAllDocs: {method:'GET', isArray:true}
    });

    var factory = {};
    var docs = [];

    factory.getDocs = function () {
        if (docs.length === 0) {
            docs = resource.getAllDocs();
        }
        return docs;
    }

    factory.getDocByID = function (docid) {
        return helpers.findByID(this.getDocs(), docid);
    }

    return factory;
}]);

//***************************************************************************
// Controllers
//
// listCtrl - Controller for dashboard home, gets a list of all SPDX Docs and
//           displays it
// docCtrl - Controller for the single doc view, displays a SPDX doc in html
//          format
//***************************************************************************

// listCtrl
dashApp.controller('listCtrl', ['$scope','spdxDoc', function($scope, spdxDoc) {
    $scope.docs = spdxDoc.getDocs(); 
}]);

// docCtrl
dashApp.controller('docCtrl', ['$scope', '$routeParams', 'spdxDoc', function($scope, $routeParams, spdxDoc) {	
    $scope.editing = false;
    $scope.doc = spdxDoc.getDocByID($routeParams.id);
}]);

