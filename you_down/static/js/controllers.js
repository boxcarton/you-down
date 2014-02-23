'use strict';

/* Controllers */

function InviteController($scope, $http) {

  $http.get('data/friends.json').success(function(data){
    $scope.friends = data;
  })

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
