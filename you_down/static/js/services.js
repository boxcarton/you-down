'use strict';

angular.module('youDownServices', ['ngResource'])

.factory('Event', function($resource) {
	return $resource('data/event/:eventId', {}, {
		query: {
			method: 'GET',
			params: { eventId: '' },
			isArray: true
		}
	});
})

.factory('Friend', function($resource) {
	return $resource('data/:friendId.json', {}, {
		query: {
			method: 'GET',
			params:{friendId:'friends'},
			isArray: true
		}
	});
});


