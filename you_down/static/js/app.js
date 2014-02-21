'use strict';

angular.module('YouDown', ['youDownServices'])
	.config(['$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'static/partials/invite.html',
			controller: InviteController
		})
		.when('/event', {
			templateUrl: 'static/partials/event-list.html',
			controller: EventListController
		})
		.when('/event/:eventId', {
			templateUrl: '/static/partials/event-detail.html',
			controller: EventDetailController
		})
		/* Create a "/event" route that takes the user to the same place as "/event" */
		.when('/events', {
			templateUrl: 'static/partials/event-list.html',
			controller: EventListController
		})
		.otherwise({
			redirectTo: '/'
		})
		;

		$locationProvider.html5Mode(true);
	}])
;