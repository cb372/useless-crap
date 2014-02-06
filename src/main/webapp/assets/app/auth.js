angular.module('auth', [])

.factory('auth', function($q, $log, $location) {

  OAuth.initialize('TeZVwJ9aeY9qpJcHolU0PuK6GNY');

  var twitter_client = null;

  var service = {
    twitter_account: null,

    isLoggedIn: function() {
      return !!service.twitter_account;
    },

    userId: function() {
      return service.twitter_account.id_str;
    },

    oAuthToken: function() {
      return service.isLoggedIn() ? twitter_client.oauth_token : null;
    },

    oAuthTokenSecret: function() {
      return service.isLoggedIn() ? twitter_client.oauth_token_secret : null;
    },

    ensureLoggedIn: function() {
      if (service.isLoggedIn()) {
        $log.info('User is already logged in: ' + service.twitter_account);
      } else {
        $log.info('User is not logged in. Redirecting to /login');
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

        $log.info('User logged in. Retrieving user info from Twitter');
        twitter_client.get('1.1/account/verify_credentials.json').done(function(res){
          service.twitter_account = res;
          deferred.resolve();
        }).fail(function() {
          deferred.reject("Failed to get your user info from Twitter. Fail whale??");
        });
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