(function () {
    'use strict';

    angular.module('app.notifications')
        .directive('apimNotifAdminGranted', adminGranted)
        .directive('apimNotifAdminRevoked', adminRevoked)
        .directive('apimNotifAnnouncementNew', announcementNew)
        .directive('apimNotification', notification)
        .directive('apimNotifContractAccepted', contractAccepted)
        .directive('apimNotifContractPending', contractPending)
        .directive('apimNotifContractRejected', contractRejected)
        .directive('apimNotifContractRequestCancelled', contractRequestCancelled)
        .directive('apimNotifMembershipGranted', membershipGranted)
        .directive('apimNotifMembershipPending', membershipPending)
        .directive('apimNotifMembershipRevoked', membershipRevoked)
        .directive('apimNotifMembershipRevokedRole', membershipRevokedRole)
        .directive('apimNotifMembershipUpdated', membershipUpdated)
        .directive('apimNotifMembershipTransfer', membershipTransfer)
        .directive('apimNotifMembershipRejected', membershipRejected)
        .directive('apimNotifMembershipRequestCancelled', membershipRequestCancelled);


    function adminGranted() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/admin-granted.html',
            controller: clearableNotifCtrl
        }
    }


    function adminRevoked() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/admin-revoked.html',
            controller: clearableNotifCtrl
        }
    }

    function announcementNew() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/announcement-new.html',
            controller: clearableNotifCtrl
        }
    }


    function contractAccepted() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/contract-accepted.html',
            controller: function ($scope, currentUserModel) {
                $scope.clear = clear;
                //Only a user with appAdmin rights can delete an organization-wide contract rejection notification
                $scope.canClear = currentUserModel.isAuthorizedForIn("appAdmin", $scope.notification.applicationOrgId);


                function clear($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.clearFunction()($scope.notification);
                }
            }
        }
    }
    
    function contractPending() {
        return {
            restrict: 'E',
            scope: {
                notification: '='
            },
            templateUrl: 'views/templates/notification/partials/contract-pending.html'
        }
    }
    
    function contractRejected() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/contract-rejected.html',
            controller: function ($scope, currentUserModel) {
                $scope.clear = clear;
                //Only a user with appAdmin rights can delete an organization-wide contract rejection notification
                $scope.canClear = currentUserModel.isAuthorizedForIn("appAdmin", $scope.notification.applicationOrgId);

                function clear($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.clearFunction()($scope.notification);
                }
            }
        }
    }

    function contractRequestCancelled() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/contract-request-cancelled.html',
            controller: clearableNotifCtrl
        }
    }
    
    function notification() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/notification.html',
            controller: function ($scope, NOTIFICATIONS) {
                $scope.clear = clear;
                init();

                function init() {
                    switch ($scope.notification.type) {
                        case NOTIFICATIONS.USER.ADMIN_GRANTED.toUpperCase():
                            $scope.adminGranted = true;
                            break;
                        case NOTIFICATIONS.USER.ADMIN_REVOKED.toUpperCase():
                            $scope.adminRevoked = true;
                            break;
                        case NOTIFICATIONS.USER.ANNOUNCEMENT_NEW.toUpperCase():
                            $scope.announcementNew = true;
                            break;
                        case NOTIFICATIONS.USER.MEMBERSHIP_GRANTED.toUpperCase():
                            $scope.membershipGranted = true;
                            break;
                        case NOTIFICATIONS.USER.MEMBERSHIP_REJECTED.toUpperCase():
                            $scope.membershipRejected = true;
                            break;
                        case NOTIFICATIONS.USER.MEMBERSHIP_PENDING.toUpperCase():
                            $scope.membershipPending = true;
                            break;
                        case NOTIFICATIONS.USER.MEMBERSHIP_REVOKED.toUpperCase():
                            $scope.membershipRevoked = true;
                            break;
                        case NOTIFICATIONS.USER.MEMBERSHIP_REVOKED_ROLE.toUpperCase():
                            $scope.membershipRevokedRole = true;
                            break;
                        case NOTIFICATIONS.USER.MEMBERSHIP_TRANSFER.toUpperCase():
                            $scope.membershipTransfer = true;
                            break;
                        case NOTIFICATIONS.USER.MEMBERSHIP_UPDATED.toUpperCase():
                            $scope.membershipUpdated = true;
                            break;
                        case NOTIFICATIONS.ORG.CONTRACT_PENDING.toUpperCase():
                            $scope.contractPending = true;
                            break;
                        case NOTIFICATIONS.ORG.CONTRACT_ACCEPTED.toUpperCase():
                            $scope.contractAccepted = true;
                            break;
                        case NOTIFICATIONS.ORG.CONTRACT_REJECTED.toUpperCase():
                            $scope.contractRejected = true;
                            break;
                        case NOTIFICATIONS.ORG.CONTRACT_REQUEST_CANCELLED.toUpperCase():
                            $scope.contractRequestCancelled = true;
                            break;
                        case NOTIFICATIONS.ORG.MEMBERSHIP_REQUEST_CANCELLED.toUpperCase():
                            $scope.membershipRequestCancelled = true;
                            break;
                    }
                }

                function clear(notification) {
                    $scope.clearFunction()(notification);
                }
            }
        }
    }
    
    function membershipGranted() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-granted.html',
            controller: clearableNotifCtrl
        }
    }    
    
    function membershipPending() {
        return {
            restrict: 'E',
            scope: {
                notification: '='
            },
            templateUrl: 'views/templates/notification/partials/membership-pending.html',
        }
    }

    function membershipRequestCancelled() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-request-cancelled.html',
            controller: clearableNotifCtrl
        }
    }
    
    function membershipRejected() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-rejected.html',
            controller: clearableNotifCtrl
        }
    }

    function membershipRevoked() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-revoked.html',
            controller: clearableNotifCtrl
        }
    }

    function membershipRevokedRole() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-revoked-role.html',
            controller: clearableNotifCtrl
        }
    }

    function membershipUpdated() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-updated.html',
            controller: clearableNotifCtrl
        }
    }

    function membershipTransfer() {
        return {
            restrict: 'E',
            scope: {
                notification: '=',
                clearFunction: '&'
            },
            templateUrl: 'views/templates/notification/partials/membership-transfer.html',
            controller: clearableNotifCtrl
        }
    }

    function clearableNotifCtrl($scope) {
        $scope.clear = clear;
        $scope.org = $scope.notification.orgDetails;

        function clear($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.clearFunction()($scope.notification);
        }
    }
})();
