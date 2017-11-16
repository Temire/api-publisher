;(function(angular) {
    'use strict';

    angular.module('app.ctrl.auth.oauth', [])

        .controller('OAuthCtrl',
            function ($scope, $http, $window, $stateParams, $sessionStorage, oAuthService,
                      alertService, ALERT_TYPES) {

                $scope.canGrant = canGrant;
                $scope.doCancel = doCancel;
                $scope.doGrant = doGrant;
                $scope.closeAlert = alertService.closeAlert;
                $scope.isValid = false;
                $scope.selectedScopes = [];
                $scope.appOAuthInfo = {};
                $scope.alerts = alertService.alerts;

                init();

                function init() {
                    alertService.resetAllAlerts();
                    if ($stateParams.scopes) {
                        $scope.requestedScopes = $stateParams.scopes.split(',');
                        $scope.isValid = true;
                    } else {
                        $scope.requestedScopes = [];
                    }
                    if ($stateParams.apikey) {
                        $sessionStorage.apikey = $stateParams.apikey;
                    }

                    oAuthService.getAppOAuthInfo($stateParams.client_id,
                        $stateParams.org_id,
                        $stateParams.service_id,
                        $stateParams.version)
                        .then(function (value) {
                            $scope.appOAuthInfo = value;
                            // Initially all requested scopes will be selected
                            angular.forEach(value.scopes, function (value, key) {
                                if ($scope.requestedScopes.length > 0 && $scope.requestedScopes.indexOf(key) > -1) {
                                    $scope.selectedScopes.push({scope: key, desc: value, checked: true});
                                }
                            });
                        });
                }

                function canGrant() {
                    var canDoGrant = false;
                    if ($stateParams.scopes == undefined || $stateParams.scopes == null) return true;
                    angular.forEach($scope.selectedScopes, function (value) {
                        if (value.checked) {
                            canDoGrant = true;
                        }
                    });
                    return canDoGrant;
                }

                function doCancel() {
                    $sessionStorage.ttl = new Date();
                    $window.location.href = $scope.appOAuthInfo.consumerResponse.redirectUri + '?error=cancelled';
                }
                function doGrant() {
                    alertService.resetAllAlerts();
                    oAuthService.grant(
                        $scope.appOAuthInfo.authorizationUrl,
                        $scope.appOAuthInfo.consumerResponse.clientId,
                        $scope.appOAuthInfo.consumerResponse.clientSecret,
                        $stateParams.response_type,
                        $scope.selectedScopes,
                        $scope.appOAuthInfo.serviceProvisionKey,
                        $stateParams.authenticatedUserId
                    ).then(function (value) {
                            $sessionStorage.ttl = new Date();
                            window.location.href = value.data.redirect_uri;
                        }, function (error) {
                            alertService.addAlert(ALERT_TYPES.DANGER,
                                '<b>Uh-oh...</b> Something went wrong, we could not complete the grant process.');
                        });
                }
            });

    // #end
})(window.angular);
