'use strict';

/* Controllers */

function InviteController($scope, Restangular) {

  var accounts = Restangular.all('account')
  var events = Restangular.all('event')

  accounts.getList().then(function(friends) {
    $scope.friends = friends;
  });

  var selectedFriends = function() {
    return _.map(
              _.filter(
                $scope.friends, 
                function(f){ return f.selected == true}
              ), 
            function(f) {return _.pick(f,'id')}
           );
  }

  $scope.invite = function invite() {
    $scope.event.not_attendees = selectedFriends();
    events.post($scope.event)
  }
}

function EventListController($scope, Restangular) {
  var events = Restangular.all('event')
  events.getList().then(function(events) {
    $scope.events = events;
    console.log(events);
  });
}

function FriendListController($scope, Restangular) {
  var friends = Restangular.all('account')
  friends.getList().then(function(friends) {
    $scope.friends = friends;
    console.log(friends);
  });

}


function EventDetailController($scope, $routeParams, Event) {

}
