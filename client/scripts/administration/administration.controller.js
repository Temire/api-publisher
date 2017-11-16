;(function() {
    'use strict';

    angular.module('app.administration')
        .controller('AdministrationCtrl', administrationCtrl)
        .controller('AddAdminCtrl', addAdminCtrl)
        .controller('AdminExpirationCtrl', adminExpirationCtrl)
        .controller('AdminTermsCtrl', adminTermsCtrl)
        .controller('AdminOAuthRevokeCtrl', adminOAuthRevokeCtrl)
        .controller('AdminStatusCtrl', adminStatusCtrl)
        .controller('AdminUsersCtrl', adminUsersCtrl)
        .controller('AdminBrandingCtrl', adminBrandingCtrl)
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


    function adminExpirationCtrl($scope, $uibModal, oauthExp, jwtExp, toastService) {
        $scope.adminTab.updateTab('Expiration');
        $scope.confirmRegenerateAPIKeys = confirmRegenerateAPIKeys;
        $scope.confirmRegenerateCredentials = confirmRegenerateCredentials;
        $scope.tokenTimeout = {
            oauth: oauthExp.expirationTime,
            jwt: jwtExp.expirationTime
        };
        $scope.updateExpirationTimes = updateExpirationTimes;


        function updateExpirationTimes() {
            $scope.adminHelper.updateExpirationTimes($scope.tokenTimeout.oauth, $scope.tokenTimeout.jwt).then(function (reply) {
                $scope.toastService.createToast($scope.TOAST_TYPES.SUCCESS, "Expiration times updated!", true);
            }, function () {
                $scope.toastService.createToast($scope.TOAST_TYPES.DANGER, "Could not update expiration times.", true);
            });
        }

        function confirmRegenerateAPIKeys() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/reissueApiKeysConfirm.html',
                controller: 'ConfirmRevokeCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

            modalInstance.result.then(function () {
                // Confirmation received, revoke grants
                $scope.adminHelper.reissueAllKeys().then(function () {
                    toastService.success('All API keys have been reissued successfully!');
                }, function (error) {
                    toastService.createErrorToast(error, 'Failed to reissue API keys.');
                })
            })
        }

        function confirmRegenerateCredentials() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/reissueOAuthConfirm.html',
                controller: 'ConfirmRevokeCtrl as ctrl',
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

            modalInstance.result.then(function () {
                // Confirmation received, revoke grants
                $scope.adminHelper.reissueAllCredentials().then(function () {
                    toastService.success('All OAuth Credentials have been reissued successfully!');
                }, function (error) {
                    toastService.createErrorToast(error, 'Failed to reissue OAuth Credentials.');
                })
            })
        }
    }

    function adminTermsCtrl($scope, currentTerms, adminHelper) {
        $scope.adminTab.updateTab('Terms');
        $scope.terms = currentTerms.terms;
        $scope.updateDefaultTerms = updateDefaultTerms;


        function updateDefaultTerms() {
            adminHelper.setDefaultTerms($scope.terms).then(function () {
                $scope.toastService.success('<b>Default Terms & Conditions updated.');
            }, function (err) {
                $scope.toastService.createErrorToast(err, 'Could not update default Terms & Conditions');
            });

        }
    }

    function adminOAuthRevokeCtrl($scope, $uibModal, toastService, _) {
        $scope.adminTab.updateTab('OAuth');
        // $scope.confirmRegenerateAPIKeys = confirmRegenerateAPIKeys;
        // $scope.confirmRegenerateCredentials = confirmRegenerateCredentials;
        $scope.change = change;
        $scope.sel = false;
        $scope.canDoBulkOperation = canDoBulkOperation;
        $scope.revokeSelected = revokeSelected;
        $scope.revokAllForUser = revokeAllForUser;
        $scope.grants = [ { name: 'A User', grants: [{ name: 'An App' }, { name: 'Another App'}] }];

        function change() {
            _.forEach($scope.grants, function (user) {
                user.selected = !!$scope.sel;
            })
        }

        function canDoBulkOperation() {
            return _.find($scope.grants, function (user) {
                return user.selected;
            })
        }

        function revokeAllForUser(user) {
            doRevoke([ user ]).then(function () {
                toastService.success('Grant revoked.');
            });
        }

        function revokeSelected() {
            var toRevoke = _.filter($scope.grants, function (user) {
                return user.selected;
            });
            doRevoke(toRevoke).then(function () {
                toastService.success('Grants revoked.');
            })
        }

        function doRevoke(toRevoke) {
            return currentUser.revokeUserGrants(toRevoke).then(function () {
                $scope.connectedApps = _.difference($scope.connectedApps, toRevoke);
            });
        }

        function confirmRegenerateAPIKeys() {
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
        
        function confirmRegenerateCredentials() {
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

    function adminBrandingCtrl($scope, brandingData) {
        $scope.adminTab.updateTab('Branding');
        $scope.branding = brandingData;
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
                    },function(error){toastService.createErrorToast(error, 'Failed to grant admin privileges.');});

                    break;
            }
            userpromise.then(function (user) {
                if (user) {
                    AdminUser.save({id:user.username},function(reply){
                        $scope.modalClose();
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Granted <b>' + user.username + '</b> with admin priviledges', true);
                    },function(error){toastService.createErrorToast(error, 'Failed to grant admin privileges.');});
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
