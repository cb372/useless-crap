var app = angular.module('app', []);


app.controller('AppCtrl', function($scope, $log){
    $scope.submitTransaction = function() {
        $log.info('Sending transaction for ' + $scope.amount);
    }
});