;(function(angular) {
    'use strict';

    angular.module('app.ctrl.auth.oauth', [])

        .controller('OAuthCtrl', ['$scope', '$stateParams', 'ApplicationOAuth',
            function ($scope, $stateParams, ApplicationOAuth) {
                console.log($stateParams);
                $scope.doCancel = doCancel;
                $scope.doGrant = doGrant;
                getAppOAuthInfo();

                var json = {"consumerResponse":{"id":"53b452b4-9bee-4141-c1b4-19e48ebe6834","consumerId":"af9a764a-9b74-416b-c19e-f7ac2a34b66f","name":"OAuthTestApp","clientId":"bcf7f7bb-8537-4054-a2c7-b1cbcf238d04","clientSecret":"92f1a15e-5fa3-4673-98f6-8539b04ac6c1","redirectUri":"http://localhost:4000/","createdAt":1.443344148E12},"consumer":{"id":"af9a764a-9b74-416b-c19e-f7ac2a34b66f","username":"admin","customId":"admin","key":null,"createdAt":1.443184355E12},"scopes":{"delete_profile":"Grant to delete your profile","test_profile":"Grant test for your user profile"},"base64AppLogo":"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","appVersion":"v3","serviceProvisionKey":"536a5c5c78954db9cde46fb93bbeb0d6"}
                $scope.appOAuthInfo = angular.fromJson(json);
                console.log($scope.appOAuthInfo);

                function doCancel() {
                    console.log('Canceling...');
                    window.history.back();
                    //TODO what happens when a user cancels?
                }
                function doGrant() {
                    console.log('Granting...');
                }

                function getAppOAuthInfo() {
                    ApplicationOAuth.get({clientId: $stateParams.client_id,
                        orgId: $stateParams.org_id,
                        svcId: $stateParams.service_id,
                        versionId: $stateParams.version
                    }, function (reply) {
                        console.log(reply);
                    })
                }

            }]);

    // #end
})(window.angular);
