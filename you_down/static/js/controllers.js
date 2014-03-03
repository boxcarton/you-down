'use strict';

function InviteController($scope, Restangular) {
  var users = Restangular.all('user')
  var events = Restangular.all('event')
  var invite = Restangular.all('invite')

  users.getList().then(function(users) {
    $scope.users = _.each(users, function(f){f.selected = false});

  });

  var selectedUsers = function() {
    return _.map(
              _.filter(
                $scope.users, 
                function(f){ return f.selected == true}
              ), 
            function(f) {return _.pick(f,'id')}
           );
  };

  $scope.invite = function() {
    $scope.event.not_attendees = selectedUsers();
    events.post($scope.event).then(function(newEvent){
      invite.post(newEvent);
    });
  }
}

function EventListController($scope, Restangular) {
  var eventsPromise = Restangular.all('event')
  eventsPromise.getList({'results_per_page': 100}).then(function(events) {
    $scope.events = events.reverse();
  });
}

function EventDetailController($scope, $stateParams, Restangular) {
  var eventPromise = Restangular.one('event', $stateParams.eventId)
  eventPromise.get().then(function(event){
    $scope.event = event;
  })

  $scope.deleteEvent = function(){
    $scope.event.remove();
  }
}

function UserListController($scope, Restangular) {
  var usersPromise = Restangular.all('user')
  usersPromise.getList({'results_per_page': 100}).then(function(users) {
    $scope.users = users;
  });
}

function UserDetailController($scope, $stateParams, Restangular) {
  var userPromise = Restangular.one('user', $stateParams.userId)
  userPromise.get().then(function(user){
    $scope.user = user;
  })

  $scope.deleteUser = function(){
    $scope.user.remove();
  }
}

function AddUserController($scope, Restangular) {
  var usersPromise = Restangular.all('user');
  $scope.addUser = function() {
    usersPromise.post($scope.newUser);
  }
}

function EventConfirmationController($scope, $stateParams, Restangular) {
  var eventPromise = Restangular.one('event', $stateParams.eventId).get();
  var userId = parseInt($stateParams.userId);
  getAttendance();

  function getAttendance() {
    //make both the attending and not attending lists with current user removed
    eventPromise.then(function(event){
      $scope.event = event;
      
      //make arrays of just Ids for easier operation
      var attendingIds = _.map($scope.event.attendees, function(l){return l.id});
      var notAttendingIds = _.map($scope.event.not_attendees, function(l){return l.id});

      if (_.contains(attendingIds, userId)) {
        $scope.isInvited = true;
        $scope.attendStatus = "attending";
        $scope.user = _.filter($scope.event.attendees, function(a) {return a.id === userId})[0]
        $scope.event.attendees = _.reject($scope.event.attendees, function(a) {return a.id === userId})
      }  else if(_.contains(notAttendingIds, userId)) {
        $scope.isInvited = true;
        $scope.attendStatus = "not_attending";
        $scope.user = _.filter($scope.event.not_attendees,function(a) {return a.id === userId})[0]
        $scope.event.not_attendees = _.reject($scope.event.not_attendees, function(a) {return a.id === userId})
      } else {
        $scope.isInvited = false;
        $scope.attendStatus = "not_attending";
      }
    });
  }

  $scope.updateStatus = function() {
    //get the most updated state from database to avoid state tracking in code
    getAttendance(); 
    if($scope.attendStatus === "attending") {
      $scope.event.attendees.push($scope.user)
    } else {
      $scope.event.not_attendees.push($scope.user)
    }
    $scope.event.put()
  }
}