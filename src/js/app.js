angular
	.module('app', [
		'ui.router'
	])
	.config(['$urlRouterProvider', '$stateProvider',
					function($urlRouterProvider, $stateProvider) 
					{
						$urlRouterProvider.otherwise('/dashboard');

						$stateProvider
							.state('dashboard', {
								url: '/dashboard',
								templateUrl: 'partials/listview.html'
							})
					}]);
