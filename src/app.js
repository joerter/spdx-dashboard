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
    var serverRoot = "http://localhost:3000";
    return $resource(serverRoot + '/api/spdx/:docId', {docId: '@id'}, {
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
        // save copies of doc comments and license concluded to check later
        $scope.doccomment = $scope.doc.document_comment;
        $scope.licenseconcluded = $scope.doc.package_license_concluded;
    });

    // open the modal
    $scope.open = function () {
        var saveModal = $modal.open({
            templateUrl: 'partials/saveModal.html',
            controller: 'saveModalCtrl',
            resolve: {
                changes: function () {
                    var changesArray = [];
                    if ($scope.doccomment != $scope.doc.document_comment) {
                        changesArray.push({
                            field: 'Document Comment', 
                            original: $scope.doccomment, 
                            change: $scope.doc.document_comment
                        });
                    }
                    if ($scope.licenseconcluded != $scope.doc.package_license_concluded) {
                         changesArray.push({
                            field: 'Package License Concluded', 
                            original: $scope.licenseconcluded, 
                            change: $scope.doc.package_license_concluded
                         });
                    }
                    return changesArray;
                }
            }
        });

        saveModal.result.then(function () {
            $scope.doc.id = $routeParams.id;
            SPDXDoc.update({
                document_comment: $scope.doc.document_comment,
                licenseconcluded: $scope.doc.package_license_concluded,
                package_id: $scope.doc.package_id
            }, $scope.doc);
        });
    }
    
}]);

dashApp.controller('saveModalCtrl', ['$scope', '$modalInstance', 'changes', function($scope, $modalInstance, changes) {
    $scope.changes = changes;
    if ($scope.changes.length === 0) {
        $scope.message = "No changes were made";
        $scope.nochanges = true;
    }
    else {
        $scope.message = "You've made some changes!";
    }


    $scope.save = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

