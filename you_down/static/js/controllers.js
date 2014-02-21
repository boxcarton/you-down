'use strict';

/* Controllers */

function InviteController($scope) {
 $scope.friends = [
    { name: 'boyuan', number: 1, selected: true},
    { name: 'calvin', number: 2, selected: true },
    { name: 'muksit', number: 3, selected: false },
    { name: 'yasaman', number: 4, selected: false }
  ];

  var selectedFriends = function() {
    return _.filter($scope.friends, function(f){ return f.selected == true });
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
