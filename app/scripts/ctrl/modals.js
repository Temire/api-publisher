;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals', [])

        /// ==== AddPolicy Controller
        .controller('AddPolicyCtrl',
            function ($scope, $modal, $state, $stateParams, policyDefs,
                      toastService, TOAST_TYPES, PlanVersionPolicy, ServiceVersionPolicy) {

                $scope.policyDefs = policyDefs;
                $scope.valid = false;
                $scope.selectedPolicy = null;
                $scope.modalClose = modalClose;
                $scope.setValid = setValid;
                $scope.setConfig = setConfig;
                $scope.getConfig = getConfig;
                $scope.addPolicy = addPolicy;
                $scope.selectPolicy = selectPolicy;

                init();

                function init() {
                    switch ($state.current.data.type) {
                        case 'plan':
                            PlanVersionPolicy.query(
                                {orgId: $stateParams.orgId,
                                    planId: $stateParams.planId,
                                    versionId: $stateParams.versionId},
                                function (reply) {
                                    removeUsedPolicies(reply);
                                });
                            break;
                        case 'service':
                            ServiceVersionPolicy.query(
                                {orgId: $stateParams.orgId,
                                    svcId: $stateParams.svcId,
                                    versionId: $stateParams.versionId},
                                function(reply) {
                                    removeUsedPolicies(reply);
                                });
                            break;
                    }
                }

                function removeUsedPolicies(usedPolicies) {
                    angular.forEach(usedPolicies, function (policy) {
                        for (var i = 0; i < $scope.policyDefs.length; i++) {
                            if ($scope.policyDefs[i].id === policy.policyDefinitionId) {
                                $scope.policyDefs.splice(i, 1);
                                break;
                            }
                        }
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function setValid(isValid) {
                    $scope.valid = isValid;
                }

                function setConfig(config) {
                    $scope.config = config;
                }
                function getConfig() {
                    return $scope.config;
                }

                function addPolicy() {
                    var config = $scope.getConfig();
                    var newPolicy = {
                        definitionId: $scope.selectedPolicy.id,
                        configuration: angular.toJson(config)
                    };

                    switch ($state.current.data.type) {
                        case 'plan':
                            PlanVersionPolicy.save(
                                {orgId: $stateParams.orgId,
                                    planId: $stateParams.planId, versionId: $stateParams.versionId},
                                newPolicy,
                                function(reply) {
                                    $scope.modalClose();
                                    $state.forceReload();
                                    toastService.createToast(TOAST_TYPES.SUCCESS,
                                        'Plan policy successfully added.', true);
                                }, function (error) {
                                    $scope.modalClose();
                                    toastService.createErrorToast(error, 'Could not create the plan policy.');
                                });
                            break;
                        case 'service':
                            ServiceVersionPolicy.save(
                                {orgId: $stateParams.orgId,
                                    svcId: $stateParams.svcId, versionId: $stateParams.versionId},
                                newPolicy,
                                function(reply) {
                                    $scope.modalClose();
                                    $state.forceReload();
                                    toastService.createToast(TOAST_TYPES.SUCCESS,
                                        'Service policy successfully added.', true);
                                }, function (error) {
                                    $scope.modalClose();
                                    toastService.createErrorToast(error, 'Could not create the service policy.');
                                });
                            break;
                    }

                }

                function selectPolicy(policy) {
                    if (!policy) {
                        $scope.include = undefined;
                    } else {
                        $scope.selectedPolicy = policy;
                        $scope.config = {};
                        if ($scope.selectedPolicy.formType === 'JsonSchema') {
                            //All plugins should fall into this category!
                            $scope.include = 'views/modals/partials/policy/json-schema.html';
                        } else {
                            $scope.include = 'views/modals/partials/policy/Default.html';
                        }
                    }
                }
            })

/// ==== NewAnnouncement Controller
        .controller('NewAnnouncementCtrl',
            function ($scope, $modal, $state, svcVersion, ServiceAnnouncements,
                      toastService, TOAST_TYPES) {

                $scope.serviceVersion = svcVersion;
                $scope.announcement = {
                    title: '',
                    description: ''
                };
                $scope.createAnnouncement = createAnnouncement;
                $scope.modalClose = modalClose;

                function createAnnouncement(announcement) {
                    console.log(announcement);
                    ServiceAnnouncements.save({
                            orgId: $scope.serviceVersion.service.organization.id,
                            svcId: $scope.serviceVersion.service.id},
                        announcement,
                        function (newAnnouncement) {
                            $scope.modalClose();
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Announcement <b>' + newAnnouncement.title + '</b> created!', true);
                            $state.forceReload();
                        }, function (error) {
                            if (error.status !== 409) {
                                $scope.modalClose();
                            }
                            toastService.createErrorToast(error, 'Could not create announcement.');
                        });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

        /// ==== ViewAnnouncement Controller
        .controller('ViewAnnouncementCtrl',
            function ($scope, $modal, $state, announcement, ServiceAnnouncements,
                      toastService, TOAST_TYPES) {

                $scope.announcement = announcement;
                $scope.deleteAnnouncement = deleteAnnouncement;
                $scope.modalClose = modalClose;

                function deleteAnnouncement() {
                    console.log('delete');
                    console.log(announcement);
                    ServiceAnnouncements.remove({orgId: $scope.announcement.organizationId,
                        svcId: $scope.announcement.serviceId, announcementId: $scope.announcement.id},
                        function (reply) {
                            $scope.modalClose();
                            var msg = '<b>Announcement deleted!</b>';
                            toastService.createToast(TOAST_TYPES.INFO, msg, true);
                            $state.forceReload();
                        });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

/// ==== Contract creation: Plan Selection Controller
        .controller('PlanSelectCtrl',
            function ($scope, $modal, $state, $stateParams, $timeout, selectedApp, orgScreenModel,
                      policyConfig, toastService, TOAST_TYPES, Application, ApplicationContract, ApplicationVersion,
                      CurrentUserAppOrgs, PlanVersion, PlanVersionPolicy, ServiceVersionPolicy,
                      serviceVersion, svcPolicies) {

                $scope.service = serviceVersion;
                $scope.orgScreenModel = orgScreenModel;
                $scope.servicePolicies = svcPolicies;
                $scope.selectOrg = selectOrg;
                $scope.selectApp = selectApp;
                $scope.selectPlan = selectPlan;
                $scope.selectVersion = selectVersion;
                $scope.startCreateContract = startCreateContract;
                $scope.modalClose = modalClose;

                $scope.availablePlans = [];
                $scope.policyConfig = [];
                var noPlanSelected = true;
                var hasAppContext = false;
                init();

                function init() {
                    getServicePolicyDetails(svcPolicies);
                    if (angular.isDefined(selectedApp.appVersion) && selectedApp.appVersion !== null) {
                        $scope.selectedAppVersion = selectedApp.appVersion;
                        hasAppContext = true;
                    }
                    checkOrgContext();
                    if ($scope.hasOrgContext) {
                        getOrgApps(orgScreenModel.organization.id);
                    }
                    getAvailablePlans();
                }

                function checkOrgContext() {
                    if (orgScreenModel.organization === undefined) {
                        // No org context, get user's AppOrgs
                        $scope.hasOrgContext = false;
                        CurrentUserAppOrgs.query({}, function (reply) {
                            $scope.appOrgs = reply;
                        });
                    } else {
                        $scope.hasOrgContext = true;
                        $scope.org = orgScreenModel.organization;
                    }
                }

                function getOrgApps(orgId) {
                    Application.query({orgId: orgId}, function (data) {
                        $scope.applications = data;
                        if (hasAppContext) {
                            getAppVersions($scope.selectedAppVersion.id);
                        } else {
                            getAppVersions(data[0].id);
                        }
                    });
                }

                function getAppVersions(appId) {
                    if (hasAppContext) {
                        appId = $scope.selectedAppVersion.id;
                    }
                    ApplicationVersion.query({orgId: $scope.org.id, appId: appId}, function (data) {
                        $scope.versions = data;
                        if (!hasAppContext) {
                            $scope.selectedAppVersion = data[0];
                            selectedApp.updateApplication(data[0]);
                        }
                    });
                }

                function getAvailablePlans() {
                    angular.forEach($scope.service.plans, function (value) {
                        PlanVersion.get(
                            {orgId: $scope.service.service.organization.id,
                                planId: value.planId, versionId: value.version},
                            function (planVersion) {
                                $scope.availablePlans.push(planVersion);
                                if (noPlanSelected) {
                                    $scope.selectedPlan = planVersion;
                                    getPlanPolicies();
                                    noPlanSelected = false;
                                }
                            });
                    });
                }

                function getPlanPolicies() {
                    PlanVersionPolicy.query(
                        {orgId: $scope.selectedPlan.plan.organization.id,
                            planId: $scope.selectedPlan.plan.id,
                            versionId: $scope.selectedPlan.version},
                        function (policies) {
                            $scope.selectedPlanPolicies = policies;
                            angular.forEach(policies, function (policy) {
                                getPlanPolicyDetails(policy);
                            });
                        });
                }

                function getPlanPolicyDetails(policy) {
                    PlanVersionPolicy.get(
                        {orgId: $scope.selectedPlan.plan.organization.id,
                            planId: $scope.selectedPlan.plan.id,
                            versionId: $scope.selectedPlan.version,
                            policyId: policy.id},
                        function (deets) {
                            $scope.policyConfig[deets.id] = policyConfig.createConfigObject(deets);
                        });
                }

                function getServicePolicyDetails(policies) {
                    angular.forEach(policies, function (policy) {
                        ServiceVersionPolicy.get({orgId: $scope.service.service.organization.id,
                                svcId: $scope.service.service.id,
                                versionId: $scope.service.version,
                                policyId: policy.id},
                            function (deets) {
                                $scope.policyConfig[deets.id] = policyConfig.createConfigObject(deets);
                            }
                        );
                    });
                }

                function selectOrg(organization) {
                    orgScreenModel.getOrgDataForId(orgScreenModel, organization.id);
                    $scope.org = organization;
                    $scope.hasOrgContext = true;
                    getOrgApps(organization.id);
                }

                function selectApp(application) {
                    $scope.selectedAppVersion = application;
                    getAppVersions(application.id);
                }

                function selectPlan(plan) {
                    $scope.selectedPlan = plan;
                    getPlanPolicies();
                }

                function selectVersion(version) {
                    $scope.selectedAppVersion = version;
                    selectedApp.updateApplication(version);
                }

                function startCreateContract() {
                    var contract = {
                        serviceOrgId: $scope.service.service.organization.id,
                        serviceId: $scope.service.service.id,
                        serviceVersion: $scope.service.version,
                        planId: $scope.selectedPlan.plan.id
                    };
                    ApplicationContract.save(
                        {orgId: $scope.selectedAppVersion.organizationId,
                            appId: $scope.selectedAppVersion.id,
                            versionId: $scope.selectedAppVersion.version},
                        contract,
                        function (data) {
                            $state.go('root.market-dash', {orgId: $scope.selectedAppVersion.organizationId});
                            $scope.modalClose();
                            var msg = '<b>Contract created!</b><br>' +
                                'A contract was created between application <b>' +
                                $scope.selectedAppVersion.name + ' ' +
                                $scope.selectedAppVersion.version + '</b> and service <b>' +
                                $scope.service.service.organization.name + ' ' + $scope.service.service.name + ' ' +
                                $scope.service.version + '</b>, using plan <b>' +
                                $scope.selectedPlan.plan.name + ' ' + $scope.selectedPlan.version + '</b>.';
                            toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
                        }, function (error) {
                            $state.go('root.market-dash', {orgId: $scope.selectedAppVersion.organizationId});
                            $scope.modalClose();
                            toastService.createErrorToast(error, 'Could not create the contract.');
                        });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

/// ==== Help Dialog Controller
        .controller('HelpCtrl',
            function ($scope, $modal, type) {
                $scope.type = type;
                $scope.modalClose = modalClose;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

        .controller('HowToInvokeCtrl', function ($scope, $modal, contract, endpoint) {
            $scope.contract = contract;
            $scope.endpoint = endpoint;
            $scope.modalClose = modalClose;

            function modalClose() {
                $scope.$close();
            }
        })

/// ==== OAuthConfig Controller
        .controller('OAuthConfigCtrl',
            function ($scope, $rootScope, $modal, $state, appVersionDetails,
                      ApplicationOAuthCallback, toastService, TOAST_TYPES) {

                $scope.callback = appVersionDetails.oauthClientRedirect;
                $scope.id = appVersionDetails.oAuthClientId;
                $scope.secret = appVersionDetails.oauthClientSecret;
                $scope.modalClose = modalClose;
                $scope.copyId = copyId;
                $scope.copySecret = copySecret;
                $scope.updateCallback = updateCallback;

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function copyId(id) {
                    var type = TOAST_TYPES.INFO;
                    var msg = '<b>Client Id copied to clipboard!</b><br>' + id;
                    toastService.createToast(type, msg, true);
                }
                function copySecret(secret) {
                    var type = TOAST_TYPES.INFO;
                    var msg = '<b>Client Secret copied to clipboard!</b><br>' + secret;
                    toastService.createToast(type, msg, true);
                }

                function updateCallback() {
                    var updateObject = {
                        uri: $scope.callback
                    };

                    ApplicationOAuthCallback.save(
                        {orgId: appVersionDetails.application.organization.id,
                            appId: appVersionDetails.application.id,
                            versionId: appVersionDetails.version},
                        updateObject,
                        function (reply) {
                            $scope.modalClose();
                            $state.forceReload();
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Callback URL for <b>' + appVersionDetails.application.name +  '</b> updated!',
                                true);
                        }, function (error) {
                            if (error.status !== 409) {
                                $scope.modalClose();
                            }
                            toastService.createErrorToast(error, 'Could not update the callback URL.');
                        }
                    );
                }

            })

/// ==== EditImgCtrl Controller
        .controller('EditImgCtrl',
            function ($scope, $modal, $state, $stateParams, flowFactory, alertService,
                      imageService, toastService, TOAST_TYPES, appScreenModel, currentUserModel, svcScreenModel,
                      Application, CurrentUserInfo, Service) {
                $scope.imageService = imageService;
                $scope.alerts = alertService.alerts;
                $scope.flow = flowFactory.create({
                    singleFile: true
                });
                $scope.cancel = cancel;
                $scope.readFile = readFile;
                $scope.closeAlert = closeAlert;
                $scope.updateLogo = updateLogo;
                $scope.modalClose = modalClose;

                var type = {};

                init();

                function init() {
                    if (angular.isUndefined($stateParams.appId) && angular.isUndefined($stateParams.svcId)) {
                        type = 'User';
                        $scope.currentLogo = currentUserModel.currentUser.base64pic;
                    } else if (angular.isUndefined($stateParams.planId) && angular.isUndefined($stateParams.svcId)) {
                        type = 'Application';
                        $scope.currentLogo = appScreenModel.application.application.base64logo;
                    } else {
                        type = 'Service';
                        $scope.currentLogo = svcScreenModel.service.service.base64logo;
                    }

                    alertService.resetAllAlerts();
                }

                function cancel() {
                    imageService.clear();
                    $scope.flow.cancel();
                }

                function readFile ($file) {
                    if (imageService.checkFileType($file)) {
                        imageService.readFile($file);
                        return true;
                    } else {
                        return false;
                    }
                }

                function closeAlert(index) {
                    alertService.closeAlert(index);
                }

                function updateLogo() {
                    var updateObject = {};
                    if (type === 'User') {
                        if (imageService.image.fileData) {
                            updateObject.pic = imageService.image.fileData;
                        } else {
                            updateObject.pic = '';
                        }
                    } else {
                        if (imageService.image.fileData) {
                            updateObject.base64logo = imageService.image.fileData;
                        } else {
                            updateObject.base64logo = '';
                        }
                    }

                    switch (type) {
                        case 'Application':
                            Application.update({orgId: $stateParams.orgId, appId: $stateParams.appId},
                                updateObject,
                                function (reply) {
                                    handleResult(true, 'Application logo updated!');
                                }, function (error) {
                                    handleResult(false, 'Could not update Application Logo.', error);
                                });
                            break;
                        case 'Service':
                            Service.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId},
                                updateObject,
                                function (reply) {
                                    handleResult(true, 'Service logo updated!');
                                }, function (error) {
                                    handleResult(false, 'Could not update Service Logo.', error);
                                });
                            break;
                        case 'User':
                            CurrentUserInfo.update({},
                                updateObject,
                                function (reply) {
                                    handleResult(true, 'Profile pictured saved!');
                                }, function (error) {
                                    handleResult(false, 'Could not update Profile Picture.', error);
                                });
                            break;
                    }
                }

                function handleResult(success, msg, error) {
                    $scope.modalClose();
                    if (success) {
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
                    } else {
                        toastService.createErrorToast(error, msg);
                    }
                }

                function modalClose() {
                    imageService.clear();
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

        /// ==== AddOrgMemberCtrl Controller
        .controller('AddOrgMemberCtrl',
            function ($scope, $modal, $state, org, roles, toastService, Member, UserSearch, TOAST_TYPES) {
                $scope.addMember = addMember;
                $scope.org = org;
                $scope.modalClose = modalClose;
                $scope.roles = roles;
                $scope.selectedRole = null;
                $scope.selectRole = selectRole;

                function addMember(email) {
                    var searchObj = {
                        filters: [{
                            name: 'email',
                            value: email,
                            operator: 'like'
                        }],
                        orderBy: {
                            ascending: false,
                            name: 'email'
                        }
                    };
                    UserSearch.save({}, searchObj, function (userList) {
                        if (userList.beans.length === 1) {
                            var newMemberObj = {
                                userId: userList.beans[0].username,
                                roleId: $scope.selectedRole.id
                            };
                            var name = userList.beans[0].fullName ? userList.beans[0].fullName : userList.beans[0].username;
                            Member.save({orgId: org.id}, newMemberObj, function (success) {
                                $scope.modalClose();
                                $state.forceReload();
                                toastService.createToast(TOAST_TYPES.SUCCESS, 'Added <b>' + name + '</b> (' + email + ') to <b>' + org.name + '</b> as <b>' + $scope.selectedRole.name + '</b>.', true);
                            }, function (error) {
                                toastService.createErrorToast(error, 'Failed to add user to organization :(');
                            });
                        } else {
                            toastService.createToast(TOAST_TYPES.WARNING, 'Could not find member to add with email address <b>' + email + '</b>.', true);
                        }
                    }, function (error) {
                       toastService.createErrorToast(error, 'Encoutered error searching for user');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

                function selectRole(role) {
                    $scope.selectedRole = role;
                }
            })

        /// ==== MemberRemoveCtrl Controller
        .controller('MemberRemoveCtrl',
            function ($scope, $modal, $state, member, org, toastService, TOAST_TYPES, Member) {
                $scope.doRemove = doRemove;
                $scope.member = member;
                $scope.org = org;
                $scope.modalClose = modalClose;

                function doRemove() {
                    var name = member.userName ? member.userName : member.userId;
                    Member.delete({orgId: org.id, userId: member.userId}, function (success) {
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.INFO,
                            '<b>' + name + '</b> was removed from the organization.', true);
                        $scope.modalClose();
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not remove member from organization');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            })

        /// ==== TransferOrgCtrl Controller
        .controller('TransferOrgCtrl',
            function ($scope, $modal, $state, currentOwner, newOwner, org, toastService, TOAST_TYPES, OrganizationOwnershipTransfer) {
                $scope.doTransfer = doTransfer;
                $scope.newOwner = newOwner;
                $scope.org = org;
                $scope.modalClose = modalClose;

                function doTransfer() {
                    var user = newOwner.userName.length > 0 ? newOwner.userName : newOwner.userId;
                    var transferObj = {
                        currentOwnerId: currentOwner.username,
                        newOwnerId: newOwner.userId
                    };
                    OrganizationOwnershipTransfer.save({orgId: org.id}, transferObj, function (reply) {
                        // We changed our own role, need to update the CurrentUserInfo
                        $scope.User.updateCurrentUserInfo($scope.User).then(function (success) {
                            $state.forceReload();
                            toastService.createToast('success', 'Ownership of <b>' + org.name + '</b> was successfully transferred to <b>' + user + '</b>', true);
                            $scope.modalClose();
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not retrieve updated user permissions');
                        });
                    }, function (error) {
                        toastService.createErrorToast(error, 'Failed to transfer organization ownership');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }
            });

    // #end
})(window.angular);
