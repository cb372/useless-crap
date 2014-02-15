var app = angular.module('app', [
  'ngRoute', 'ngResource', 'auth'
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
  }).when('/settings', {
    templateUrl: 'partials/settings.tmpl.html',
    controller: 'SettingsCtrl'
  }).otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(false);
});

app.controller('PurchaseCtrl', function($scope, $log, $http, $resource, constants){

  $scope.user = $resource('/api/user').get();
  $scope.recentPurchases = [];
  $scope.userStats = $resource('/api/user/stats').get();

  $http.get('/api/purchases/recent')
      .success(function(data) {
        addRecentPurchases(data);
      });

  $scope.submitPurchase = function() {
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

app.controller('SettingsCtrl', function($scope, $log, $resource){
  $scope.user = $resource('/api/user').get();

  $scope.saveSettings = function() {
    $scope.user.$save(function(updatedUser, putResponseHeaders) {
      $scope.infoMsg = 'Settings updated!';
    });
  }

});
