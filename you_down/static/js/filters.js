'use strict';

/* Filters */

angular.module('youDownFilters', []).filter('uppercase', function() {
	return function(input) {
		return input.toUpperCase();
	}
});