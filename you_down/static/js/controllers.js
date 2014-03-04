'use strict';

function InviteController($scope, Restangular) {
  var users = Restangular.all('users')
  var events = Restangular.all('events')
  var invite = Restangular.all('invite')

  users.getList().then(function(users) {
    $scope.users = _.each(users, function(f){f.selected = false});

    //hack to split users into two columns
    var half_length = Math.ceil($scope.users.length / 2);  
    $scope.users_1 = $scope.users.slice(0, half_length);
    $scope.users_2 = $scope.users.slice(half_length, $scope.users.length);
  });

  var getSelectedUsers = function() {
    var s1 = _.filter($scope.users_1, 
                       function(f){ return f.selected == true}
                     );
    var s2 = _.filter($scope.users_2, 
                       function(f){ return f.selected == true}
                     );
    s1.push.apply(s1, s2);

    return s1
  }
  
  var formatSelectedUsers = function(users) {
    return _.map(users, 
             function(f) {return _.pick(f,'id')}
           ); 
  }

  $scope.invite = function() {
    var selected = getSelectedUsers()
    $scope.event.not_attendees = formatSelectedUsers(selected);
    events.post($scope.event).then(function(newEvent){
      invite.post(newEvent);
    });
  }
}

function EventListController($scope, Restangular) {
  var eventsPromise = Restangular.all('events')
  eventsPromise.getList({'results_per_page': 100}).then(function(events) {
    $scope.events = events.reverse();
  });
}

function EventDetailController($scope, $stateParams, Restangular) {
  var eventPromise = Restangular.one('events', $stateParams.eventId)
  eventPromise.get().then(function(event){
    $scope.event = event;
  })

  $scope.deleteEvent = function(){
    $scope.event.remove();
  }
}

function UserListController($scope, Restangular) {
  var usersPromise = Restangular.all('users')
  usersPromise.getList({'results_per_page': 100}).then(function(users) {
    $scope.users = users;
  });
}

function UserDetailController($scope, $stateParams, Restangular) {
  var userPromise = Restangular.one('users', $stateParams.userId)
  userPromise.get().then(function(user){
    $scope.user = user;
  })

  $scope.deleteUser = function(){
    $scope.user.remove();
  }
}

function AddUserController($scope, Restangular) {
  var usersPromise = Restangular.all('users');
  $scope.addUser = function() {
    usersPromise.post($scope.newUser);
  }
}

function EventConfirmationController($scope, $stateParams, Restangular) {
  var eventPromise = Restangular.one('events', $stateParams.eventId).get();
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