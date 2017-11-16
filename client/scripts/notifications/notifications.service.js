(function () {
    'use strict';

    angular.module('app.notifications')
        .service('notificationService', notificationService);


    function notificationService($q, orgService, PendingNotifications, Notifications,
                                 UserIncomingNotifications, UserOutgoingNotifications,
                                 OrgIncomingNotifications, OrgOutgoingNotifications,
                                 NOTIFICATIONS, _) {
        this.clear = clear;
        this.clearAll = clearAll;
        this.getIncomingForOrg = getIncomingForOrg;
        this.getNotificationsForUser = getNotificationsForUser;
        this.getOrgsWithPendingRequest = getOrgsWithPendingRequest;
        this.getPendingNotificationsForUser = getPendingNotificationsForUser;
        this.getOutgoingForOrg = getOutgoingForOrg;
        
        function clear(notification) {
            if (_.find(NOTIFICATIONS.ORG, function (n) {
                    return n.toUpperCase() === notification.type;
                })) {
                return OrgIncomingNotifications.delete({
                    orgId: notification.applicationOrgId,
                    notificationId: notification.id
                }).$promise;
            }

            if (_.find(NOTIFICATIONS.USER, function (m) {
                    return m.toUpperCase() === notification.type;
                })) {
                return UserIncomingNotifications.delete({ notificationId: notification.id }).$promise;
            }
        }

        function clearAll() {
            return UserIncomingNotifications.delete({}).$promise;
        }

        function getIncomingForOrg(orgId) {
            return OrgIncomingNotifications.query({ orgId: orgId }).$promise;
        }
        
        function getNotificationsForUser() {
            return Notifications.query().$promise;
        }

        function getOrgsWithPendingRequest() {
            // TODO rework to reduce number of backend calls
            return UserOutgoingNotifications.query().$promise.then(function (notifications) {
                var orgPromises = [];
                _.forEach(_.remove(notifications, function (o) {
                    return o.type === NOTIFICATIONS.USER.MEMBERSHIP_PENDING;
                }), function (notif) {
                    orgPromises.push(orgService.orgInfo(notif.destinationId));
                });
                return $q.all(orgPromises).then(function (results) {
                    return results;
                })
            });
        }

        function getPendingNotificationsForUser() {
            return PendingNotifications.query().$promise;
        }

        function getOutgoingForOrg(orgId) {
            return OrgOutgoingNotifications.query({ orgId: orgId }).$promise;
        }
    }

})();
