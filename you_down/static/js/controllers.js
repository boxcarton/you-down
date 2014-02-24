'use strict';

/* Controllers */

function InviteController($scope, Friend) {

  Friend.get({}, function(friends) {
    $scope.friends = friends.objects;
  });

  var selectedFriends = function() {
    return _.filter($scope.friends, function(f){
      return f.selected == true
    });
  }

  $scope.invite = function invite() {
    var list = selectedFriends();
    console.log(list)
  }
}

function EventListController($scope, Event) {
	var eventsQuery = Event.get({}, function(events) {
		$scope.events = events.objects;
	});
}

function EventDetailController($scope, $routeParams, Event) {
	var eventQuery = Event.get({ eventId: $routeParams.eventId }, function(eventDetail) {
		$scope.eventDetail = eventDetail;
	});
}
