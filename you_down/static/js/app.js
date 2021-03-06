'use strict';

// store a global with the time auth status last changed. 
// Used for expiring pages from template cache, jQuery-style.
var authtime = Date.now();

var youDownApp = angular.module('YouDown', 
  ['ui.router', 'restangular', 'ui.bootstrap','TokenAuth'])
  
.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
         '$locationProvider', 'RestangularProvider', 
  function($stateProvider, $urlRouterProvider, $httpProvider,
           $locationProvider, RestangularProvider) {
    $stateProvider
      .state('menu', {
        url: '',
        abstract: true,
        templateUrl: 'static/partials/menu.html'
      })

      .state('register', {
        url: '/register',
        templateUrl: 'static/partials/register.html',
        controller: 'RegisterController'
      })
      
      .state('login', {
        url: '/login',
        templateUrl: 'static/partials/login.html',
        controller: 'LoginController'
      })
      
      .state('menu.invite', {
        url: '/invite',
        templateUrl: 'static/partials/invite.html',
        controller: 'InviteController'
      })
    
      .state('menu.events', {
        url: '/events',
        templateUrl: 'static/partials/event-list.html',
        controller: 'EventListController'
      })
      
      .state('menu.event-detail', {
        url: '/events/:eventId',
        templateUrl: '/static/partials/event-detail.html',
        controller: 'EventDetailController'
      })

      .state('event-confirm', {
        url: '/confirm/:eventId?userId',
        templateUrl: '/static/partials/event-confirm.html',
        controller: 'EventConfirmController'
      })

      .state('menu.users', {
        url: '/users',
        templateUrl: 'static/partials/user-list.html',
        controller: 'UserListController'
      })

      .state('menu.user-detail', {
        url: '/users/:userId',
        templateUrl: '/static/partials/user-detail.html',
        controller: 'UserDetailController'
      })

      .state('menu.add-user', {
        url: '/adduser',
        templateUrl: '/static/partials/add-user.html',
        controller: 'AddUserController'
      })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/invite');
    $urlRouterProvider.when('/logout', 'login');
    //$locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

    RestangularProvider.setBaseUrl('/api'); 
    RestangularProvider.setResponseExtractor(function(response, operation) { 
      var newResponse; 
      if (operation === 'getList') {
        // Return the result objects as an array and attach the metadata 
        newResponse = response.objects; 
        newResponse.metadata = { 
          numResults: response.num_results, 
          page: response.page, 
          totalPages: response.total_pages 
        }; 
      } else { 
        newResponse = response; 
      } 
      return newResponse;
    }); 
}])

.run(['$state', function ($state) {
  //go here initially
  $state.transitionTo('menu.invite'); 
}]);