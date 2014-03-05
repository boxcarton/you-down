'use strict';

var youDownApp = angular.module('YouDown', ['ui.router', 'restangular', 'ui.bootstrap'])
  .config(['$stateProvider', '$routeProvider', 
           '$locationProvider', 'RestangularProvider',
    function($stateProvider, $urlRouterProvider,
             $locationProvider, RestangularProvider) {
    $stateProvider
      .state('menu', {
        url: '/',
        abstract: true,
        templateUrl: 'static/partials/menu.html'
      })
      
      .state('menu.secret_invite', {
        url: '/secretinvite',
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

      .state('event-confirmation', {
        url: '/confirm/:eventId?userId',
        templateUrl: '/static/partials/event-confirmation.html',
        controller: 'EventConfirmationController'
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
    $urlRouterProvider.otherwise('/');
    //$locationProvider.html5Mode(true);

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
    $state.transitionTo('menu.events'); 
  }]);