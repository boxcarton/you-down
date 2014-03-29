/*
  Authentication
*/
var justLoggedOut = false;

angular.module('TokenAuth', ['ui.router', 'ngStorage'])

.factory('Auth', 
         ['$q', '$http', '$localStorage', '$location', '$rootScope',
         function ($q, $http, $localStorage, $location, $rootScope) {
  var getToken = function(username, password) {
    var deferred = $q.defer();
    var encoded = Base64.encode(username + ':' + password);
    $http({
        method: 'GET', 
        url: '/auth/token', 
        headers: {'Authorization': 'Basic ' + encoded}
      }).success(function(data, status, headers, config) {
        $localStorage.token = data.token;

        authtime = Date.now();
        deferred.resolve();
      }).error(function(data, status, headers, config){
        // Erase the token if the user fails to log in
        delete $localStorage.token;
        delete $localStorage.username;
        authtime = Date.now();
        deferred.reject('could not fetch token');
      });
      return deferred.promise;
  };

  var destroyToken = function() {
    delete $localStorage.token;
    delete $localStorage.username;
    authtime = Date.now();
  };

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

.factory('authInterceptor', 
         ['$rootScope', '$q', '$localStorage', '$location', '$injector', 
         function($rootScope, $q, $localStorage, $location, $injector) {
  return {
    request: function (config) {

      // only insert auth token for relative URLs
      // see: http://stackoverflow.com/a/19709846
      var r = new RegExp('^(?:[a-z]+:)?//', 'i');

      if (r.test(config.url)) {
        // absolue URL; do nothing.
        return config;
      }
        
      if (config.url.indexOf('?') != -1) {
        config.url = config.url + "&_=" + authtime;
      }else{
        config.url = config.url + "?_=" + authtime;
      }
      config.headers = config.headers || {};
      if ($localStorage.token) {
        config.headers.Authorization = 'Basic ' + 
                                       Base64.encode($localStorage.token);
      }
      return config;
    },
    response: function(response) {
        return response || $q.when(response);
    },
    responseError: function(rejection) {
      var $state = $injector.get('$state');
      if (rejection.status === 401) {
          $state.transitionTo('login');
      }
      return $q.reject(rejection);
    }
  };
}]);
