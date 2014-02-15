angular.module('auth', [])

.factory('auth', function($q, $log, $location) {

  OAuth.initialize('TeZVwJ9aeY9qpJcHolU0PuK6GNY');

  var twitter_client = null;

  var service = {
    isLoggedIn: function() {
      return !!twitter_client;
    },

    oAuthToken: function() {
      return service.isLoggedIn() ? twitter_client.oauth_token : null;
    },

    oAuthTokenSecret: function() {
      return service.isLoggedIn() ? twitter_client.oauth_token_secret : null;
    },

    ensureLoggedIn: function() {
      if (!service.isLoggedIn()) {
        $location.path('/login');
      }
    },

    doTwitterLogin: function() {
      var deferred = $q.defer();
      OAuth.popup("twitter", function(err, data) {
        if (err) {
          $q.reject("Please link the app with your Twitter account");
          return;
        }

        // Save the Twitter client for use later
        twitter_client = data;

        deferred.resolve();
      });

      return deferred.promise;
    }

  };

  return service;
})

.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($q, auth) {
    return {
      'request': function(config) {
        config.headers['oauth_token'] = auth.oAuthToken();
        config.headers['oauth_token_secret'] = auth.oAuthTokenSecret();
        return config;
      }
    };
  });
});