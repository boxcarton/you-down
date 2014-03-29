'use strict';

/* Filters */
youDownApp

.filter('replaceUnderscore', function() {
  return function(input) {
    if (input) {
      return input.replace(/_/g, ' ');
    }
  }
})

.filter('capitalize_name', function() {
  return function(input, scope) {
  if (input)
    input = input.toLowerCase();
    return input.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + 
             txt.substr(1).toLowerCase();
    });
  }
});