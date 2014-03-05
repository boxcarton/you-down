'use strict';

/* Filters */

angular.module('youDownFilters', [])

.filter('uppercase', function() {
	return function(input) {
		return input.toUpperCase();
	}
})

.filter('capitalize_name', function() {
  return function(input, scope) {
    if (input!=null)
      input = input.toLowerCase();
      return input.replace(/\w\S*/g, function(txt){
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
});