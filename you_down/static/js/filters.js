'use strict';

/* Filters */
youDownApp

.filter('replace_attend', function() {
  return function(input) {
    if (input) {
      if (input === "attending") {
        return input.replace("attending", "down"); 
      } 
      if (input === "not_attending") {
        return input.replace("not_attending", "not down");
      }
    }
  }
})

.filter('first_name', function() {
  return function(input) {
    if (input) {
      return input.split(' ')[0];
    }
  }
})

.filter('local_time', function() {
  return function(input) {
    if (input) {
      return input.split(' ')[0];
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