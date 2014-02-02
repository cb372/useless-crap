var app = angular.module('app', [
    'ngRoute', 'auth'
]);

app.run(['auth', function(auth) {
  auth.ensureLoggedIn();
}]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/purchase.tmpl.html',
    controller: 'PurchaseCtrl'
  }).when('/login', {
    templateUrl: 'partials/login.tmpl.html',
    controller: 'LoginCtrl'
  }).otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(false);
});

app.controller('PurchaseCtrl', function($scope, $log, $http, auth){

  $scope.submitPurchase = function() {
    $log.info('Sending purchase for ' + $scope.amount + ' by user ' + auth.userId());
    $http.post('/api/purchases', {amount: $scope.amount, userId: auth.userId()})
        .success(function() {
          $scope.infoMsg = 'OK, got it!';
          reset();
        })
        .error(function(data, status) {
          $scope.errorMsg = 'Oh dear, got a ' + status + ' response. Please try again later.';
        });
  };

  function reset() {
    $scope.amount = null;
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
