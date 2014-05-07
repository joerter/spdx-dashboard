// create angular module for dashApp
var dashApp = angular.module('dashApp', ['ngRoute', 'ngResource', 'ui.bootstrap', 'angularFileUpload']);

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

// spdxDoc factory for managing getting spdx docs from the server
dashApp.factory('SPDXDoc', ['$resource', function($resource) {
    // define the resource object. we can use this to do queries 
    var serverRoot = "http://spdxdev.ist.unomaha.edu:3000";
    return $resource(serverRoot + '/api/spdx/:docId', {docId: '@id'}, {
        update: {method:'PUT'}
    });
}]);

dashApp.factory('File', ['$resource', function($resource) {
    // define the resource object. we can use this to do queries 
    var serverRoot = "http://spdxdev.ist.unomaha.edu:3000";
    return $resource(serverRoot + '/api/files/:docId', {docId: '@id'}, {
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
// pluginCtrl - Controller for loading plugins
//***************************************************************************

// pluginCtrl
dashApp.controller('pluginCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('./plugins.json').then(function(result){
        $scope.plugins = result.data;
    }, function(){
        $scope.plugins = [];
    });
}]);

// listCtrl
dashApp.controller('listCtrl', ['$scope', '$modal', 'SPDXDoc', function($scope, $modal, SPDXDoc) {
    $scope.docs = SPDXDoc.query();
    
    // open the modal
    $scope.open = function () {
        var uploadModal = $modal.open({
            templateUrl: 'partials/uploadModal.html',
            controller: 'uploadModalCtrl'
        });
      };
}]);

// docCtrl
dashApp.controller('docCtrl', ['$scope', '$routeParams', '$modal', 'SPDXDoc', 'File', 
function($scope, $routeParams, $modal, SPDXDoc, File) {	
    $scope.editing = false;
    
    SPDXDoc.get({docId: $routeParams.id}, function(spdx) {
        $scope.doc = spdx;
        $scope.cleandoc = angular.fromJson(angular.toJson(spdx, 1));
        
    });
    
    // save a clean copy to check for changes later
    /*SPDXDoc.get({docId: $routeParams.id}, function(spdx) {
        $scope.cleandoc = spdx;
        console.log(spdx);
    });*/
    
    $scope.getFiles = function () {
        $scope.files = [];
        File.get({docId: $routeParams.id}, function(f) {
            if (f instanceof Array) {
                $scope.files = f;
            }
            else {
                $scope.files.push(f);
            }
        });
    }

    // open the modal
    $scope.open = function () {
        var saveModal = $modal.open({
            templateUrl: 'partials/saveModal.html',
            controller: 'saveModalCtrl',
            resolve: {
                changes: function () {
                    var changesArray = [];
                    for (var key in $scope.cleandoc) {
                        if ($scope.cleandoc[key] != $scope.doc[key]) {
                            changesArray.push({
                                field: key,
                                original: $scope.cleandoc[key],
                                change: $scope.doc[key]
                            });
                        }
                    }
                    return changesArray;
                }
            }
        });

        saveModal.result.then(function () {
            $scope.doc.id = $routeParams.id;
            SPDXDoc.update($scope.doc);
        });
    };
    
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

dashApp.controller('uploadModalCtrl', ['$scope', '$upload', '$modalInstance', function($scope, $upload, $modalInstance) {
	$scope.files = [];
	$scope.onFileSelect = function($files) {
		if(angular.isArray($files)){
			for(var i = 0; i < $files.length; i++){
				$scope.files.push($files[i]);	
			}
		}
		else{
			$scope.files.push($files);	
		}
		
	};

    $scope.submitUplaod = function ($index) {
        	    //$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; i < $scope.files.length; i++) {
			if(i == $index){
				var file = $scope.files[i];
				$scope.upload = $upload.upload({
			    	url: 'http://spdxdev.ist.unomaha.edu:3000/api/scan', //upload.php script, node.js route, or servlet url
					method: 'POST',
					// headers: {'header-key': 'header-value'},
					// withCredentials: true,
					data: {myObj: $scope.myModelObj},
					file: file // or list of files: $files for html5 only
					/* set the file formData name ('Content-Desposition'). Default is 'file' */
					//fileFormDataName: myFile, //or a list of names for multiple files (html5).
					/* customize how data is added to formData. See #40#issuecomment-28612000 for sample code */
					//formDataAppender: function(formData, key, val){}
		  		}).progress(function(evt) {
			    	console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
			  	}).success(function(data, status, headers, config) {
			    	// file is uploaded successfully
			    	var idx = $scope.files.indexOf(file);
			    	$scope.uploadedFile = $scope.files[idx].name + " Successfully Uploaded!";
			    	$scope.files.splice(idx, 1);
			  	}).error(function(){
			  		var idx = $scope.files.indexOf(file);
			  		$scope.uploadedFile = $scope.files[idx].name + " Failed to Upload!";
			    	$scope.files.splice(idx, 1);
			  	});
				//.error(...)
				//.then(success, error, progress); 
				//.xhr(function(xhr){xhr.upload.addEventListener(...)})// access and attach any event listener to XMLHttpRequest.
			}
		}
    };

    $scope.cancelUpload = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
