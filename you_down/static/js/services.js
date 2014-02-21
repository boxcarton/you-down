'use strict';

angular.module('youDownServices', ['ngResource'])
	.factory('Event', function($resource) {
		return $resource('/api/event/:eventId', {}, {
			query: {
				method: 'GET',
				params: { eventId: '' },
				isArray: true
			}
		});
	});



