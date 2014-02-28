'use strict';

function InviteController($scope, Restangular) {
  var users = Restangular.all('user')
  var events = Restangular.all('event')

  users.getList().then(function(friends) {
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
  };

  $scope.invite = function() {
    $scope.event.not_attendees = selectedFriends();
    console.log($scope.event);
    events.post($scope.event);
  };
}

function EventListController($scope, Restangular) {
  var eventsPromise = Restangular.all('event')
  eventsPromise.getList().then(function(events) {
    $scope.events = events;
  });
}

function FriendListController($scope, Restangular) {
  var friendsPromise = Restangular.all('user')
  friendsPromise.getList().then(function(friends) {
    $scope.friends = friends;
  });
}

function EventDetailController($scope, $stateParams, Restangular) {
  $scope.eventPromise = Restangular.one('event', $stateParams.eventId).get()
}

function EventConfirmationController($scope, $stateParams, Restangular) {
  var eventPromise = Restangular.one('event', $stateParams.eventId).get();
  var userId = parseInt($stateParams.userId);
  $scope.isInvited = false;
  $scope.attendStatus = "not_attending";

  eventPromise.then(function(event){
    $scope.event = event;
    console.log(event);
    var attendingIds = _.map($scope.event.attendees, function(l){return l.id});
    var notAttendingIds = _.map($scope.event.not_attendees, function(l){return l.id});

    if (_.contains(attendingIds, userId)) {
      $scope.isInvited = true;
      $scope.attendStatus = "attending";
      $scope.user = _.filter($scope.event.attendees,function(a) {return a.id === userId})
      $scope.event.attendees = _.reject($scope.event.attendees,function(a) {return a.id === userId})
    }  

    if(_.contains(notAttendingIds, userId)) {
      $scope.isInvited = true;
      $scope.attendStatus = "not_attending";
      $scope.user = _.filter($scope.event.attendees,function(a) {return a.id === userId})
      $scope.event.not_attendees = _.reject($scope.event.not_attendees,function(a) {return a.id === userId})
    }
  });
  
  $scope.updateStatus = function() {
    if($scope.attendStatus === "attending") {
      $scope.event.attendees.push($scope.user)
    } else {
      $scope.event.not_attendees.push($scope.user)
    }
    console.log($scope.attendStatus)
  }
}