var app = angular.module('app', [
  'ngRoute', 'auth'
]);

app.constant('constants', {
  recentPurchasesLimit: 5
});

app.run(function(auth) {
  auth.ensureLoggedIn();
});

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

app.controller('PurchaseCtrl', function($scope, $log, $http, auth, constants){

  $scope.userCurrency = '¥'; // TODO read from user settings
  $scope.recentPurchases = [];
  $scope.userStats = { totalSpent: 0, since: null };

  $http.get('/api/purchases/recent')
      .success(function(data) {
        addRecentPurchases(data);
      });

  $http.get('/api/user/stats')
      .success(function(data) {
        setUserStats(data);
      });

  $scope.submitPurchase = function() {
    $log.info('Sending purchase for ' + $scope.amount + ' by user ' + auth.userId());
    $http.post('/api/purchases', {amount: $scope.amount, tags: parseTags()})
        .success(function(data) {
          $scope.infoMsg = 'OK, got it!';
          addRecentPurchases([data]);
          incrementTotalSpent($scope.amount);
          reset();
        })
        .error(function(data, status) {
          $scope.errorMsg = 'Oh dear, got a ' + status + ' response. Please try again later.';
        });
  };

  function addRecentPurchases(purchases) {
    Array.prototype.unshift.apply($scope.recentPurchases, purchases);
    trimArray($scope.recentPurchases, constants.recentPurchasesLimit);
  }

  function setUserStats(data) {
    incrementTotalSpent(data.totalSpent);
    $scope.userStats.since = data.since;
  }

  function incrementTotalSpent(amount) {
    $scope.userStats.totalSpent += amount;
  }

  function trimArray(array, maxSize) {
    if (array.length > maxSize) {
      array.splice(maxSize, (array.length - maxSize));
    }
  }

  function reset() {
    $scope.amount = null;
    $scope.tags = null;
  }

  function parseTags() {
    // TODO should be doing this with parsers and formatters
    if (!$scope.tags) return [];
    return $scope.tags.split(/\s*,\s*/); // split by comma and trim spaces
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
