(function () {
    'use strict';

    angular.module('app.administration')
        .directive('apimDatabaseLogo', databaseLogo);


    function databaseLogo() {
        return {
            restrict: 'E',
            scope: {
                dbName: '@'
            },
            template: '<img style="max-height: 40px" ng-attr-src="{{imageSrc}}">',
            controller: function ($scope) {
                switch ($scope.dbName) {
                    case 'cassandra':
                        $scope.imageSrc = 'images/cassandra_logo.png';
                        break;
                    case 'postgres':
                        $scope.imageSrc = 'images/postgresql-logo.png'
                }
            }
        }
    }


})();
