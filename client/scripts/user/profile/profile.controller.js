(function () {
    'use strict';

    angular.module('app.user.profile')
    /// ==== User Controller
        .controller('UserCtrl', userCtrl)
        .controller('UserSecurityCtrl', userSecurityCtrl)
        .controller('UserEmailCtrl', userEmailCtrl)
        .controller('UserNotificationsCtrl', userNotificationsCtrl)
        .controller('UserProfileCtrl', userProfileCtrl);



    function userCtrl($scope, headerModel, userScreenModel, toastService, currentUser, currentUserModel) {

        init();

        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.selectedTab = 1;
        $scope.user = userScreenModel;
        $scope.isActive = isActive;
        $scope.saveUserDetails = saveUserDetails;
        $scope.addScheme = addScheme;

        function addScheme(event) {
            var input = event.target;
            var string = input.value;
            if (!(string.indexOf("http") === 0)) {
                string = "http://" + string;
            }
            userScreenModel.userInfo.website = string;
            input.value = string;
        }

        function init() {
            headerModel.setIsButtonVisible(false, false, false);

            userScreenModel.userInfo.base64pic = $scope.User.currentUser.base64pic;

            if ($scope.User.currentUser.bio != null && $scope.User.currentUser.bio.length > 0 && userScreenModel.userInfo.bio.length === 0) {
                userScreenModel.userInfo.bio = $scope.User.currentUser.bio;
            }

            if ($scope.User.currentUser.company != null && $scope.User.currentUser.company.length > 0 && userScreenModel.userInfo.company.length === 0) {
                userScreenModel.userInfo.company = $scope.User.currentUser.company;
            }

            if ($scope.User.currentUser.location != null && $scope.User.currentUser.location.length > 0 && userScreenModel.userInfo.location.length === 0) {
                userScreenModel.userInfo.location = $scope.User.currentUser.location;
            }

            if ($scope.User.currentUser.website != null && $scope.User.currentUser.website.length > 0 && userScreenModel.userInfo.website.length === 0) {
                userScreenModel.userInfo.website = $scope.User.currentUser.website;
            }

            if ($scope.User.currentUser.fullName != null && $scope.User.currentUser.fullName.length > 0 && userScreenModel.userInfo.fullName.length === 0) {
                userScreenModel.userInfo.fullName = $scope.User.currentUser.fullName;
            }
        }

        function isActive(tabName) {
            return tabName === userScreenModel.selectedTab;
        }

        function saveUserDetails(details) {
            var updateObject = {
                fullName: details.fullName,
                company: details.company,
                location: details.location,
                bio: details.bio,
                website: details.website,
                email: details.email,
                pic: details.base64pic
            };
            if (details.bio.length > 100000) {
                toastService.error("Maximum character limit of 100,000 for Bio exceeded");
            }
            else{
                currentUser.update(updateObject).then(function () {
                    //$scope.User.updateCurrentUserInfo($scope.User);
                    currentUserModel.refreshCurrentUserInfo(currentUserModel);
                    toastService.createToast('info', 'Profile updated!', true);
                }, function (error) {
                    console.log(error);
                    toastService.createErrorToast(error, 'Could not update your Profile. ');
                });
            }
        }
    }
    
    function userSecurityCtrl($scope, $uibModal, userGrants, userScreenModel, toastService, OAuthTokenRevoke, $q, _) {
        userScreenModel.updateTab('Security');
        $scope.canDoBulkOperation = canDoBulkOperation;
        $scope.change = change;
        $scope.revoke = revoke;
        $scope.revokeSelected = revokeSelected;
        $scope.connectedApps = userGrants;
        $scope.sel = false;


        function change() {
            _.forEach($scope.connectedApps, function (app) {
                app.selected = !!$scope.sel;
            })
        }

        function canDoBulkOperation() {
            return _.find($scope.connectedApps, function (app) {
                return app.selected;
            })
        }

        function revoke(app) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/revokeTokenConfirm.html',
                controller: 'ConfirmRevokeCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
            modalInstance.result.then(function () {
                doRevoke([app]).then(function () {
                    toastService.success('Token revoked.');
                }, function (error) {
                    toastService.createErrorToast(error, 'Failed to revoke token.');
                });
            });
        }

        function revokeSelected() {
            var toRevoke = _.filter($scope.connectedApps, function (app) {
                return app.selected;
            });
            var modalUrl = 'views/modals/revokeTokenConfirm.html';
            if (toRevoke.length > 1) modalUrl = 'views/modals/revokeTokensConfirm.html';
            var modalInstance = $uibModal.open({
                templateUrl: modalUrl,
                controller: 'ConfirmRevokeCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

            modalInstance.result.then(function () {
                doRevoke(toRevoke).then(function () {
                    if (toRevoke.length === 1) toastService.success('Token revoked.');
                    else toastService.success('Tokens revoked.');
                }, function (error) {
                    if (toRevoke.length === 1) toastService.createErrorToast(error, 'Failed to revoke token.');
                    else toastService.createErrorToast(error, 'Failed to revoke tokens.');
                })
            });
        }

        function doRevoke(toRevoke) {
            let promises = [];
            _.forEach(_.map(toRevoke, 'originalToken.accessToken'), function (token) {
                promises.push(OAuthTokenRevoke.delete({ token: token }).$promise);
            });
            return $q.all(promises).then(() => {
                $scope.connectedApps = _.difference($scope.connectedApps, toRevoke);
            });
        }
    }

    function userEmailCtrl(userScreenModel) {
        userScreenModel.updateTab('Email');
    }

    function userProfileCtrl(userScreenModel) {
        userScreenModel.updateTab('Profile');

    }

    function userNotificationsCtrl(userScreenModel) {
        userScreenModel.updateTab('Notifications');
    }
})();
