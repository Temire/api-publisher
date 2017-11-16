(function () {
    'use strict';

    angular.module('app.members')
        .service('memberHelper', memberHelper)
        .service('memberService', memberService);

    function memberHelper($uibModal, $state, toastService, TOAST_TYPES, currentUserModel, Member) {
        this.addMember = addMember;
        this.grantRoleToMember = grantRoleToMember;
        this.removeMember = removeMember;
        this.transferOwnership = transferOwnership;

        function addMember(org, roles) {
            $uibModal.open({
                templateUrl: 'views/modals/organizationAddMember.html',
                size: 'lg',
                controller: 'AddOrgMemberCtrl as ctrl',
                resolve: {
                    org: function() {
                        return org;
                    },
                    roles: function() {
                        return roles;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }

        function grantRoleToMember(org, role, currentUser, member) {
            var updateObject = {
                userId: member.userId,
                roleId: role.id
            };
            Member.update({orgId: org.id, userId: member.userId},
                updateObject,
                function (reply) {
                    Member.query({orgId: org.id}, function (updatedList) {
                        if (member.userId === currentUser.username) {
                            // We changed our own role, need to update the CurrentUserInfo
                            currentUserModel.refreshCurrentUserInfo(currentUserModel);
                        }
                        $state.forceReload();
                        var name = member.userName ? member.userName : member.userId;
                        toastService.createToast(TOAST_TYPES.INFO,
                            '<b>' + name + '</b> now has the <b>' + role.name + '</b> role.', true);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not retrieve updated member roles');
                    });
                },
                function (error) {
                    toastService.createErrorToast(error, 'Could not update member role');
                });
        }

        function removeMember(org, member) {
            $uibModal.open({
                templateUrl: 'views/modals/organizationRemoveMember.html',
                size: 'lg',
                controller: 'MemberRemoveCtrl as ctrl',
                resolve: {
                    org: function () {
                        return org;
                    },
                    member: function () {
                        return member;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }

        function transferOwnership(org, currentUser, member) {
            $uibModal.open({
                templateUrl: 'views/modals/organizationTransferOwner.html',
                size: 'lg',
                controller: 'TransferOrgCtrl as ctrl',
                resolve: {
                    org: function () {
                        return org;
                    },
                    currentOwner: function () {
                        return currentUser;
                    },
                    newOwner: function () {
                        return member;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }
    }

    function memberService($rootScope, $q, CancelRequest, Member, MembershipRequests, RejectRequest, RequestMembership, userService, EVENTS) {
        this.getMembersForOrg = getMembersForOrg;
        this.getPendingRequests = getPendingRequests;
        this.grantMembership = grantMembership;
        this.rejectMembershipRequest = rejectMembershipRequest;
        this.requestMembership = requestMembership;
        this.cancelMembershipRequest = cancelMembershipRequest;

        function getMembersForOrg(orgId) {
            var deferred = $q.defer();
            Member.query({orgId: orgId}).$promise.then(function (memberData) {
                var promises = [];
                angular.forEach(memberData, function (member) {
                    promises.push(userService.getUserDetails(member.userId).then(function (results) {
                        member.userDetails = results;
                    }));
                });
                $q.all(promises).then(function () {
                    deferred.resolve(memberData);
                });
            });
            return deferred.promise;
        }

        function getPendingRequests(orgId) {
            return MembershipRequests.query({ orgId: orgId }).$promise;
        }

        function grantMembership(orgId, request, roleId) {
            var newMemberObj = {
                userId: request.userDetails.username,
                roleId: roleId
            };
            return Member.save({ orgId: orgId }, newMemberObj, function () {
                $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
            }).$promise;
        }

        function rejectMembershipRequest(orgId, userId) {
            return RejectRequest.save({ orgId: orgId, userId: userId },{}, function () {
                $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
            }).$promise;
        }

        function requestMembership(orgId) {
            return RequestMembership.save({orgId: orgId}, {}, function () {
                $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
            }).$promise;
        }

        function cancelMembershipRequest(orgId) {
            return CancelRequest.save({ orgId: orgId }, {}, function () {
                $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
            }).$promise;
        }
    }

})();
