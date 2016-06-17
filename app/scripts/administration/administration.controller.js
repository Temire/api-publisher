;(function() {
    'use strict';

    angular.module('app.administration', [])
        .controller('AdministrationCtrl', administrationCtrl)
        .controller('AddAdminCtrl', addAdminCtrl)
        .controller('AdminExpirationCtrl', adminExpirationCtrl)
        .controller('AdminOAuthRevokeCtrl', adminOAuthRevokeCtrl)
        .controller('AdminStatusCtrl', adminStatusCtrl)
        .controller('AdminUsersCtrl', adminUsersCtrl)
        .controller('ConfirmRevokeCtrl', confirmRevokeCtrl)
        .controller('RemoveAdminCtrl', removeAdminCtrl);

    function administrationCtrl($scope, adminTab, adminHelper, screenSize, toastService, TOAST_TYPES) {
        $scope.toasts = toastService.toasts;
        $scope.adminHelper = adminHelper;
        $scope.adminTab = adminTab;
        $scope.toastService = toastService;
        $scope.TOAST_TYPES = TOAST_TYPES;
        $scope.xs = screenSize.on('xs', function(match) {
            $scope.xs = match;
        });
    }


    function adminExpirationCtrl($scope,oauthExp,jwtExp) {
        $scope.adminTab.updateTab('Expiration');
        console.log(oauthExp);
        console.log(jwtExp);
        $scope.tokenTimeout = {
            oauth: oauthExp.expirationTime,
            jwt: jwtExp.expirationTime
        };
        $scope.updateExpirationTimes = updateExpirationTimes;


        function updateExpirationTimes() {
            $scope.adminHelper.updateExpirationTimes($scope.tokenTimeout.oauth, $scope.tokenTimeout.jwt).then(function (reply) {
                console.log(reply);
                $scope.toastService.createToast($scope.TOAST_TYPES.SUCCESS, "Expiration times updated!", true);
            }, function () {
                $scope.toastService.createToast($scope.TOAST_TYPES.DANGER, "Could not update expiration times.", true);
            });
        }
    }

    function adminOAuthRevokeCtrl($scope, $uibModal, toastService) {
        $scope.adminTab.updateTab('OAuth');
        $scope.confirmRevokeAllGrants = confirmRevokeAllGrants;
        
        function confirmRevokeAllGrants() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/revokeOAuthConfirm.html',
                controller: 'ConfirmRevokeCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
            
            modalInstance.result.then(function () {
                // Confirmation received, revoke grants
                $scope.adminHelper.revokeAllGrants().then(function () {
                    toastService.success('All OAuth grants have been revoked successfully!');
                }, function (error) {
                    toastService.createErrorToast(error, 'Failed to revoke OAuth grants.');
                })
            })
        }
    }

    function adminStatusCtrl($scope, status) {
        $scope.adminTab.updateTab('Status');
        $scope.kongCluster = angular.fromJson(status.kongCluster);
        $scope.kongInfo = angular.fromJson(status.kongInfo);
        $scope.kongStatus = angular.fromJson(status.kongStatus);
        // console.log($scope.kongInfo);
        // console.log($scope.kongStatus);
        $scope.status = status;
        $scope.builtOn = new Date($scope.status.builtOn);
    }

    function adminUsersCtrl($scope, adminData) {
        $scope.adminTab.updateTab('Users');
        $scope.admins = adminData;
        $scope.addAdmin = addAdmin;
        $scope.removeAdmin = removeAdmin;

        function addAdmin() {
            $scope.adminHelper.addAdmin('someadmin');
        }

        function removeAdmin(admin) {
            $scope.adminHelper.removeAdmin(admin);
        }
    }

    function addAdminCtrl($scope, $state, username, toastService, AdminUser, TOAST_TYPES, EmailSearch) {
        $scope.addAdmin = addAdmin;
        $scope.username = username;
        $scope.modalClose = modalClose;
        $scope.selectedMethod = 'Username';
        $scope.selectMethod = selectMethod;

        function addAdmin(username,email) {
            var privuser;
            var privmail;
            var promise;
            var userpromise;
            switch ($scope.selectedMethod) {
                case 'Email':
                    var searchObj = {
                        userMail: ''
                    };
                    searchObj.userMail = email;
                    userpromise = EmailSearch.save({}, searchObj).$promise;
                    break;
                case 'Username':
                    privuser = username;
                    promise = AdminUser.save({id:privuser},function(reply){
                        $scope.modalClose();
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Granted <b>' + privuser + '</b> with admin priviledges', true);
                    },function(err){toastService.createErrorToast(error, 'Failed to grant admin privileges.');});

                    break;
            }
            userpromise.then(function (user) {
                if (user) {
                    AdminUser.save({id:user.username},function(reply){
                        $scope.modalClose();
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Granted <b>' + user.username + '</b> with admin priviledges', true);
                    },function(err){toastService.createErrorToast(error, 'Failed to grant admin privileges.');});
                } else {
                    toastService.createToast(TOAST_TYPES.WARNING,
                        'Could not find member to add with email address <b>' + email + '</b>.', true);
                }
            }, function (error) {
                toastService.createErrorToast(error, 'The user must have logged-in once, and entered an email.');
            });
        }

        function modalClose() {
            $scope.$close();	// this method is associated with $uibModal scope which is this.
        }

        function selectMethod(method) {
            $scope.selectedMethod = method;
        }
    }
    
    function confirmRevokeCtrl($scope, $uibModalInstance) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        
        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }
        
        function ok() {
            $uibModalInstance.close('OK');
        }
    }

    function removeAdminCtrl($scope, $state, admin, toastService, TOAST_TYPES, AdminUser) {
        $scope.doRemove = doRemove;
        $scope.admin = admin;
        $scope.modalClose = modalClose;

        function doRemove() {
            AdminUser.delete({id: admin.username}, function (success) {
                $state.forceReload();
                toastService.createToast(TOAST_TYPES.INFO,
                    '<b>' + name + '</b> admin privileges are removed.', true);
                $scope.modalClose();
            }, function (error) {
                toastService.createErrorToast(error, 'Could not remove admin privileges.');
            });
        }

        function modalClose() {
            $scope.$close();	// this method is associated with $uibModal scope which is this.
        }
    }
})();
