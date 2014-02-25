'use strict';

var youDownApp = angular.module('YouDown', ['ui.router', 'restangular'])
  .config(['$stateProvider', '$routeProvider', 
           '$locationProvider', 'RestangularProvider',
    function($stateProvider, $urlRouterProvider,
             $locationProvider, RestangularProvider) {
    $stateProvider
      .state('menu', {
        url: '/menu',
        abstract: true,
        templateUrl: 'static/partials/menu.html'
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
      /*
      .state('menu.event-detail', {
        url: '/event/:eventId',
        templateUrl: '/static/partials/event-detail.html',
        controller: 'EventDetailController'
      })*/
      
      .state('menu.friends', {
        url: '/friends',
        templateUrl: 'static/partials/friend-list.html',
        controller: 'FriendListController'
      })

    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/menu/invite');
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
    $state.transitionTo('menu.invite'); 
  }]);