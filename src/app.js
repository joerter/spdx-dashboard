// create angular module for dashApp
var dashApp = angular.module('dashApp', ['ngRoute', 'ngResource', 'ui.bootstrap']);

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
dashApp.factory('SPDXDoc', ['$resource', 'helpers', function($resource, helpers) {
    // define the resource object. we can use this to do queries 
    return $resource('http://spdxdev.ist.unomaha.edu:3000/api/spdx/:docId', {docId: '@id'}, {
        getDoc: {method:'GET', isArray:true},
        update: {method:'PUT'}
    });
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
dashApp.controller('listCtrl', ['$scope','SPDXDoc', function($scope, SPDXDoc) {
    $scope.docs = SPDXDoc.query(); 
}]);

// docCtrl
dashApp.controller('docCtrl', ['$scope', '$routeParams', '$modal', 'SPDXDoc', function($scope, $routeParams, $modal, SPDXDoc) {	
    $scope.editing = false;
    SPDXDoc.get({docId: $routeParams.id}, function(spdx) {
        $scope.doc = spdx;
    });

    // open the modal
    $scope.open = function () {
        /*var saveModal = $modal.open({
            templateUrl: 'partials/saveModal.html'
        });*/
        $scope.doc.id = $routeParams.id;
        SPDXDoc.update({
            document_comment: $scope.doc.document_comment,
            licenseconcluded: $scope.doc.package_license_concluded
        }, $scope.doc);
    }
}]);

