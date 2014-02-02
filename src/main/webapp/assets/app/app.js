var app = angular.module('app', [
    'ngRoute', 'auth'
]);

app.run(['auth', function(auth) {
  auth.ensureLoggedIn();
}]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/transaction.tmpl.html',
    controller: 'TransactionCtrl'
  }).when('/login', {
    templateUrl: 'partials/login.tmpl.html',
    controller: 'LoginCtrl'
  }).otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(false);
});

app.controller('TransactionCtrl', function($scope, $log, auth){
    $scope.submitTransaction = function() {
        $log.info('Sending transaction for ' + $scope.amount + ' user ID = ' + auth.userId());
    }
});

app.controller('LoginCtrl', function($scope, $log, $location, auth){
    $scope.twitterLogin = function() {
        auth.doTwitterLogin().then(function() {
          // success
          $location.path('/');
        }, function(errorMsg) {
            $scope.errorMsg = errorMsg;
        });
    };
});
