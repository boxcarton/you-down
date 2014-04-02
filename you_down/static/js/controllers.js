'use strict';

function MenuController($scope, $localStorage, Auth, $state) {  
  $scope.token = '';
  $scope.username = '';
  if ('token' in $localStorage) {
    $scope.token = $localStorage.token;
    var tokenPayload = angular.fromJson(
                         Base64.decode(
                          $scope.token.split('.')[1]
                       ));
    $scope.username = tokenPayload.username;
  } else {
    $state.go('login');
  }
    // register a globally-accessible logout function in the root scope.
  $scope.do_logout = function() {
    Auth.destroyToken();
    $state.go('login');
    justLoggedOut = true;
  }
}

function RegisterController($scope, Restangular) {
  var register = Restangular.all('register_user')
  $scope.register = function() {
    if ($scope.registerForm.$valid) {
      register.post($scope.newUser).then(function() {
        $scope.message = "Successfully registered";
      }, function() {
        $scope.message = "There was an error registering you";
      });
    }
  };
}

function LoginController(Auth, $scope, $rootScope, $location, 
                         $timeout, $localStorage, $state) {  
  $scope.user = {username: '', password: ''};
  $scope.login_state = '';
  if (Auth.justLoggedOutQ()) $scope.login_state = 'logout';
  
  $scope.login = function() {
    $scope.login_state = '';
    Auth.destroyToken();
    Auth.getToken($scope.user.username, $scope.user.password).then(
      function(){
        $scope.login_state = 'success';
        $scope.user.password = '';
        $timeout(function() {
          $state.go('menu.invite')
        }, 200);
        
      },
      function(){
        $scope.login_state = 'failure';
        $scope.user.password = '';
        $('input.password').focus();
      });
  }
}

function InviteController($scope, $localStorage, $state, Restangular) {
  var usersPromise = Restangular.all('users')
  var eventsPromise = Restangular.all('events')
  var invite = Restangular.all('invite')
  if ('token' in $localStorage) {
    $scope.token = $localStorage.token;
    var tokenPayload = angular.fromJson(
                         Base64.decode(
                           $scope.token.split('.')[1]
                       ));
    $scope.username = tokenPayload.username;
  } else {
    $state.go('login');
  }

  usersPromise.getList({'results_per_page': 40}).then(function(users) {
    $scope.users = _.reject(users, 
                            function(a){
                              return a.id === tokenPayload.id;
                            });
    $scope.users = _.each($scope.users, function(f){f.selected = false});
    //hack to split users into two columns
    var half_length = Math.ceil($scope.users.length / 2);  
    $scope.users_1 = $scope.users.slice(0, half_length);
    $scope.users_2 = $scope.users.slice(half_length, $scope.users.length);
  });

  var getSelectedUsers = function() {
    var s1 = _.filter($scope.users_1, 
                       function(f){ return f.selected == true }
                     );
    var s2 = _.filter($scope.users_2, 
                       function(f){ return f.selected == true }
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
    $scope.event.creator_id = tokenPayload.id;
    $scope.event.status = "pending";
    eventsPromise.post($scope.event).then(function(newEvent){
      invite.post(newEvent);
    });
  }
}

function EventListController($scope, Restangular) {
  var eventsPromise = Restangular.all('events')
  eventsPromise.getList({'results_per_page': 100}).then(function(events) {
    $scope.events = events;
    $scope.events = _.map($scope.events, function(event){
                        var time = event.created_time.toString();
                        return event.local_created_time = new Date(time);  
                      })
    $scope.events = events.reverse();
  });
}

function EventDetailController($scope, $stateParams, 
                               $localStorage, Restangular) {
  var eventPromise = Restangular.one('events', $stateParams.eventId);
  var tokenPayload = angular.fromJson(
                       Base64.decode(
                         $localStorage.token.split('.')[1]
                     ));
  
  eventPromise.get().then(function(event){
    $scope.event = event;
    $scope.isRando = true;
    if(event.creator.username === tokenPayload.username) {
      $scope.isCreator = true;
      $scope.isInvited = false;
      $scope.isRando = false;
    }
    $scope.userId = tokenPayload.id;
    var attendingIds = _.map($scope.event.attendees, 
                             function(l){
                                return l.id
                             });
    var notAttendingIds = _.map($scope.event.not_attendees, 
                                function(l){
                                  return l.id
                                });

    if (_.contains(attendingIds, $scope.userId) ||
        _.contains(notAttendingIds, $scope.userId)) {
      $scope.isCreator = false;
      $scope.isInvited = true;
      $scope.isRando = false;
    }
    //display local time instead of UTC
    var time = event.created_time.toString();
    $scope.local_created_time = new Date(time);
  })
  
  $scope.cancelEvent = function(){
    $scope.event.status = "canceled";
    $scope.event.put();
  }

  $scope.confirmEvent = function(){
    $scope.event.status = "confirmed";
    $scope.event.put();
  }

  $scope.addMeToEvent = function() {
    Restangular.one('users', tokenPayload.id).get().then(function(user){
      var currentUser = _.pick(user, 'id', 'email', 'name', 
                              'password_hash','phone','username');
      $scope.event.attendees.push(currentUser);
      $scope.event.put();
    });
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

function EventConfirmController($scope, $stateParams, Restangular) {
  var eventPromise = Restangular.one('events', $stateParams.eventId).get();
  var userId = parseInt($stateParams.userId);

  eventPromise.then(function(event){
    $scope.event = event;
    $scope.inviteList = event.attendees.concat(event.not_attendees);
    getStatus();
  });

  function getStatus () {
    //firstmake arrays of just Ids for easier operation
    var attendingIds = _.map($scope.event.attendees, 
                             function(l){
                                return l.id
                             });
    var notAttendingIds = _.map($scope.event.not_attendees, 
                                function(l){
                                  return l.id
                                });  
    if (_.contains(attendingIds, userId)) {
      $scope.isInvited = true;
      $scope.attendStatus = "attending";
    } else if (_.contains(notAttendingIds, userId)) {
      $scope.isInvited = true;
      $scope.attendStatus = "not_attending";
    } else {
      $scope.isInvited = false;
      $scope.attendStatus = "not_attending";
    }
  }

  $scope.notDown = function() {
    var user = _.filter($scope.event.attendees, 
                           function(a){
                             return a.id === userId
                           })[0];
    $scope.event.attendees = _.reject($scope.event.attendees, 
                                      function(a){
                                        return a.id === userId
                                      });
    if (user) {
      $scope.event.not_attendees.push(user);
      $scope.event.put().then(function(event){
        $scope.attendStatus === "not_attending";
      });
    }
  }

  $scope.isDown = function() {
    var user = _.filter($scope.event.not_attendees,
                           function(a){
                             return a.id === userId
                           })[0];

    $scope.event.not_attendees = _.reject($scope.event.not_attendees, 
                                          function(a){
                                            return a.id === userId
                                          });
    if (user) {
      $scope.event.attendees.push(user);
      $scope.event.put().then(function(event){
        $scope.attendStatus === "not_attending";
      });
    }
  }
}
