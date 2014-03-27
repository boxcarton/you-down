'use strict';

var justLoggedOut = false;
angular.module('Authentication', [])

/*
  Authentication service
*/
.factory('Auth', ['$q', '$http', '$window', '$location', '$rootScope', '$templateCache', 
function ($q, $http, $window, $location, $rootScope, $templateCache) {

  var getToken = function(username, password) {
    var deferred = $q.defer();
    var encoded = Base64.encode(username + ':' + password);

    $http({method: 'GET', url: '/auth/token', headers: {'Authorization': 'Basic ' + encoded}}).
      success(function(data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        $window.sessionStorage.org = data.org;
        
        var tokenPayload = angular.fromJson(Base64.decode(data.token.split('.')[1]));
        $window.sessionStorage.username = tokenPayload.u;
        $window.sessionStorage.groups = tokenPayload.g;
        
        authtime = Date.now();
        deferred.resolve();
      }).
      error(function(data, status, headers, config){
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;
        delete $window.sessionStorage.org;
        delete $window.sessionStorage.username;
        authtime = Date.now();
        deferred.reject('could not fetch token');
      });

    return deferred.promise;
  };

  var destroyToken = function() {
    delete $window.sessionStorage.token;
    delete $window.sessionStorage.org;
    delete $window.sessionStorage.username;
    authtime = Date.now();
  };

  // register a globally-accessible logout function in the root scope.
  $rootScope.do_logout = function() {
    destroyToken();
    $location.path('/logout');
    justLoggedOut = true;
  }
  
  var justLoggedOutQ = function() {
    var state = justLoggedOut;
    justLoggedOut = false;
    return(state);
  }
  
  
  // return the Auth object
  return {
    getToken: getToken,
    destroyToken: destroyToken,
    justLoggedOutQ: justLoggedOutQ
  };
}])


/*
  Auth interceptor.

  When the user is logged in, provide the auth token in the HTTP headers for every request.

  If an HTTP 401 - Not Authorized reponse is received for any content,
  redirect the user to the login page.

  In this paradigm, the app runs completely agnostic to authentication,
  but whenever it gets a 401 response it redirects the user the login page,
  with `next_location` set to take the user back to the page that generated the 401.
  
*/
.factory('authInterceptor', ['$rootScope', '$q', '$window', '$location', 
function($rootScope, $q, $window, $location) {
  return {
    request: function (config) {
    if (config.url.indexOf('?') != -1) {
      config.url = config.url + "&_=" + authtime;
    }else{
      config.url = config.url + "?_=" + authtime;
    }
    config.headers = config.headers || {};
    if ($window.sessionStorage.token) {
      config.headers.Authorization = 'Basic ' + 
                      Base64.encode($window.sessionStorage.org + 
                      ":" + $window.sessionStorage.token);
    }
    return config;
    },
    response: function(response) {
      return response || $q.when(response);
    },
    responseError: function(rejection) {
      if (rejection.status === 401) {
        if ($location.path() != '/login') {
          //redirect to login page.
          if (!('next_location' in $rootScope)) {
            $rootScope.next_location = $location.path();
          }
          $location.path("/login");
        }
      }
      return $q.reject(rejection);
    }
  };
}]);
