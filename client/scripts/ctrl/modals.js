;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals', [])
        .controller('ConfirmMembershipRequestModalCtrl', confirmMembershipRequestCtrl)
        .controller('GrantMembershipModalCtrl', grantMembershipModalCtrl)
        .controller('RejectMembershipModalCtrl', rejectMembershipModalCtrl)

        /// ==== AddPolicy Controller
        .controller('AddPolicyCtrl',
            function ($scope, $uibModal, $state, $stateParams, policyDefs,
                      toastService, TOAST_TYPES, PlanVersionPolicy, PolicyDefs, ServiceVersionPolicy, _) {

                $scope.form = ['*'];
                $scope.policyDefs = policyDefs;
                $scope.valid = false;
                $scope.selectedPolicy = null;
                $scope.modalClose = modalClose;
                $scope.setValid = setValid;
                $scope.setConfig = setConfig;
                $scope.getConfig = getConfig;
                $scope.addPolicy = addPolicy;
                $scope.selectPolicy = selectPolicy;
                $scope.type = $state.current.data.type;
                $scope.policiesAvailable = true;

                init();

                function init() {
                    switch ($scope.type) {
                        case 'plan':
                            PlanVersionPolicy.query(
                                {orgId: $stateParams.orgId,
                                    planId: $stateParams.planId,
                                    versionId: $stateParams.versionId},
                                function (reply) {
                                    if(reply.length === (policyDefs.filter(function(pol){return pol.scopePlan;})).length){$scope.policiesAvailable = false;}
                                    else $scope.policiesAvailable = true;
                                    removeUsedPolicies(reply);
                                });
                            break;
                        case 'service':
                            ServiceVersionPolicy.query(
                                {orgId: $stateParams.orgId,
                                    svcId: $stateParams.svcId,
                                    versionId: $stateParams.versionId},
                                function(reply) {
                                    if(reply.length === (policyDefs.filter(function(pol){return pol.scopeService;})).length){$scope.policiesAvailable = false;}
                                    else $scope.policiesAvailable = true;
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
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
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

                function addPolicy(form) {
                    $scope.$broadcast('schemaFormValidate');

                    if (form.$valid) {
                        console.log('valid');
                        var config = $scope.getConfig();
                        var newPolicy = {
                            definitionId: $scope.selectedPolicy.id,
                            configuration: angular.toJson(config)
                        };

                        switch ($scope.type) {
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
                                        handleError(error);
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
                                        handleError(error);
                                    });
                                break;
                        }
                    }
                }

                function selectPolicy(policy) {
                    $scope.selectedPolicy = policy;
                    $scope.config = {};
                }

                function handleError(error) {
                    if (error.status === 404) {
                        switch (error.data.errorCode) {
                            case 10003:
                                console.log('invalid config');
                                toastService.warning('<b>Invalid Policy Configuration Detected!</b><br><span class="small">' + error.data.message + '</span>');
                                break;
                        }
                    } else {
                        toastService.createErrorToast(error, 'Could not create the service policy.');
                    }
                }

                // Watch for changes to selectedDef - if the user changes from one schema-based policy
                // to another schema-based policy, then the controller won't change.  The result is that
                // we need to refresh the schema when the selectedDef changes.
                $scope.$watch('selectedPolicy', function(newValue) {
                    if (newValue && newValue.formType === 'JsonSchema') {
                        loadForm($scope.selectedPolicy);
                    }
                });

                function loadForm(policy) {
                    PolicyDefs.get({policyId: policy.id}, function (policyData) {
                        $scope.schema = angular.fromJson(policyData.form);
                        if (!_.isEmpty(policyData.formOverride)) {
                            $scope.form = angular.fromJson(policyData.formOverride);
                        }
                        else {
                            $scope.form = ['*'];
                        }
                    });
                }
            })

        /// ==== NewAnnouncement Controller
        .controller('NewAnnouncementCtrl',
            function ($scope, $uibModal, $state, svcVersion, ServiceAnnouncements,
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
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            })

        /// ==== ViewAnnouncement Controller
        .controller('ViewAnnouncementCtrl',
            function ($scope, $uibModal, $state, announcement, ServiceAnnouncements,
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
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            })

        /// ==== Contract creation: Plan Selection Controller
        .controller('PlanSelectCtrl',
            function ($scope, $uibModal, $state, $stateParams, $timeout, selectedApp, orgScreenModel,
                      policyConfig, contractService, toastService, TOAST_TYPES, Application, ApplicationVersion,
                      currentUser, PlanVersion, PlanVersionPolicy, ServiceVersionPolicy,
                      serviceVersion, svcPolicies, appService, service) {
                $scope.service = serviceVersion;
                $scope.canCreateContract = canCreateContract;
                $scope.confirmPlanSelection = confirmPlanSelection;
                $scope.orgScreenModel = orgScreenModel;
                $scope.servicePolicies = svcPolicies;
                $scope.selectOrg = selectOrg;
                $scope.selectApp = selectApp;
                $scope.selectPlan = selectPlan;
                $scope.selectVersion = selectVersion;
                $scope.startCreateContract = startCreateContract;
                $scope.modalClose = modalClose;
                $scope.atBottom = false;
                $scope.termsAgreed = {result: false};
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

                    if ($scope.service.termsAgreementRequired) {
                        if ($scope.service.service.terms && $scope.service.service.terms.length > 0) $scope.terms = $scope.service.service.terms;
                        else {
                            service.getDefaultTerms().then(function (defaults) {
                                $scope.terms = defaults.terms;
                            })
                        }
                    }
                }

                function canCreateContract() {
                    if ($scope.service.termsAgreementRequired) {
                        if ($scope.termsAgreementMode) {
                            return $scope.hasOrgContext && $scope.termsAgreed.result;
                        }
                    }
                    return $scope.hasOrgContext;

                }

                function confirmPlanSelection() {
                    $scope.termsAgreementMode = true;
                }

                function checkOrgContext() {
                    if (orgScreenModel.organization === undefined) {
                        // No org context, get user's AppOrgs
                        $scope.hasOrgContext = false;
                        currentUser.getUserAppOrgs().then(function (reply) {
                            var orgs = [];
                            angular.forEach(reply, function (org) {
                                appService.getAppsForOrg(org.id).then(function (apps) {
                                    if (apps.length > 0) orgs.push(org);
                                })
                            });
                            $scope.appOrgs = orgs;
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
                    if ($scope.service.termsAgreementRequired && !$scope.termsAgreementMode) $scope.termsAgreementMode = true;
                    else {
                        requestContract().then(function () {
                            $state.go('root.market-dash', {orgId: $scope.selectedAppVersion.organizationId});
                            $scope.modalClose();
                            if ($scope.service.autoAcceptContracts) {
                                createContractToast();
                            } else {
                                requestContractToast();
                            }
                        }, function (error) {
                            $scope.modalClose();
                            if ($scope.service.autoAcceptContracts) {
                                toastService.createErrorToast(error, 'Could not create the contract.');
                            } else {
                                toastService.createErrorToast(error, 'Could not request the contract.');
                            }
                        })
                    }
                }

                function createContractToast() {
                    var serviceOrgName = $scope.service.service.organization.name;
                    if ($scope.service.service.organization.friendlyName && $scope.service.service.organization.friendlyName.length > 0) {
                        serviceOrgName = $scope.service.service.organization.friendlyName;
                    }

                    var msg = '<b>Contract created!</b><br>' +
                        'A contract was created between application <b>' +
                        $scope.selectedAppVersion.name + ' ' +
                        $scope.selectedAppVersion.version + '</b> and service <b>' +
                        serviceOrgName + ' ' + $scope.service.service.name + ' ' +
                        $scope.service.version + '</b>, using plan <b>' +
                        $scope.selectedPlan.plan.name + ' ' + $scope.selectedPlan.version + '</b>.';
                    toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
                }

                function requestContractToast() {
                    var serviceOrgName = $scope.service.service.organization.name;
                    if ($scope.service.service.organization.friendlyName && $scope.service.service.organization.friendlyName.length > 0) {
                        serviceOrgName = $scope.service.service.organization.friendlyName;
                    }

                    var msg = '<b>Contract requested!</b><br>' +
                        'A contract request between application <b>' +
                        $scope.selectedAppVersion.name + ' ' +
                        $scope.selectedAppVersion.version + '</b> and service <b>' +
                        serviceOrgName + ' ' + $scope.service.service.name + ' ' +
                        $scope.service.version + '</b>, using plan <b>' +
                        $scope.selectedPlan.plan.name + ' ' + $scope.selectedPlan.version + '</b> was sent to the service owner for review.';
                    toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
                }

                function requestContract() {
                    return contractService.request($scope.service.service.organization.id,
                        $scope.service.service.id,
                        $scope.service.version,
                        $scope.selectedPlan.plan.id,
                        $scope.selectedAppVersion.organizationId,
                        $scope.selectedAppVersion.id,
                        $scope.selectedAppVersion.version,
                        $scope.termsAgreed.result)
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            })

        /// ==== Help Dialog Controller
        .controller('HelpCtrl',
            function ($scope, $uibModal, type) {
                $scope.type = type;
                $scope.modalClose = modalClose;

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            })

        /// ==== EditImgCtrl Controller
        .controller('EditImgCtrl',
            function ($scope, $uibModal, $state, $stateParams, flowFactory, alertService,
                      imageService, toastService, TOAST_TYPES, appScreenModel, currentUserModel, svcScreenModel,
                      Application, currentUser, Service) {
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

                function cancel(flow) {
                    flow.cancel();
                    imageService.clear();
                    alertService.resetAllAlerts();
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
                            currentUser.update(updateObject).then(
                                function () {
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
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            })

        /// ==== AddOrgMemberCtrl Controller
        .controller('AddOrgMemberCtrl',
            function ($scope, $uibModal, $state, org, roles, toastService, Member, UserSearch, EmailSearch, TOAST_TYPES) {
                $scope.addMember = addMember;
                $scope.org = org;
                $scope.modalClose = modalClose;
                $scope.roles = roles;
                $scope.selectedMethod = 'Username';
                $scope.selectMethod = selectMethod;
                $scope.selectedRole = null;
                $scope.selectRole = selectRole;

                function addMember(username, email) {
                    var searchObj = {
                        userName: '',
                        userMail: ''
                    };

                    var promise;
                    switch ($scope.selectedMethod) {
                        case 'Email':
                            searchObj.userMail = email;
                            promise = EmailSearch.save({}, searchObj).$promise;
                            break;
                        case 'Username':
                            searchObj.userName = username;
                            promise = UserSearch.save({}, searchObj).$promise;
                            break;
                    }

                    promise.then(function (user) {
                        if (user) {
                            var newMemberObj = {
                                userId: user.username,
                                roleId: $scope.selectedRole.id
                            };
                            var msg = user.name ? 'Added <b>' + user.name + '</b> (' + user.username + ') to <b>'
                            + $scope.orgName + ' </b> as <b>' + $scope.selectedRole.name + '</b>.' :
                            'Added <b>' + user.username + '</b> to <b>' + $scope.org.name + ' </b> as <b>' +
                                $scope.selectedRole.name + '</b>.' ;
                            Member.save({orgId: org.id}, newMemberObj, function () {
                                $scope.modalClose();
                                $state.forceReload();
                                toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
                            }, function (error) {
                                toastService.createErrorToast(error, 'Failed to add user to organization :(');
                            });
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

                function selectRole(role) {
                    $scope.selectedRole = role;
                }
            })

        /// ==== MemberRemoveCtrl Controller
        .controller('MemberRemoveCtrl',
            function ($scope, $uibModal, $state, member, org, toastService, TOAST_TYPES, Member) {
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
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            })

        /// ==== TransferOrgCtrl Controller
        .controller('TransferOrgCtrl',
            function ($scope, $uibModal, $state, currentOwner, newOwner, org, toastService, TOAST_TYPES,
                      currentUserModel, OrganizationOwnershipTransfer) {
                $scope.doTransfer = doTransfer;
                $scope.newOwner = newOwner;
                $scope.org = org;
                $scope.modalClose = modalClose;

                function doTransfer() {
                    var user = newOwner.userName ? newOwner.userName : newOwner.userId;
                    var transferObj = {
                        currentOwnerId: currentOwner.username,
                        newOwnerId: newOwner.userId
                    };
                    OrganizationOwnershipTransfer.save({orgId: org.id}, transferObj, function (reply) {
                        // We changed our own role, need to update the CurrentUserInfo
                        currentUserModel.refreshCurrentUserInfo(currentUserModel).then(function (success) {
                            $state.forceReload();
                            toastService.createToast('success', 'Ownership of <b>' + $scope.org.name +
                                '</b> was successfully transferred to <b>' + user + '</b>', true);
                            $scope.modalClose();
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not retrieve updated user permissions');
                        });
                    }, function (error) {
                        toastService.createErrorToast(error, 'Failed to transfer organization ownership');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            });

    function confirmMembershipRequestCtrl($scope, $uibModalInstance, org) {
        $scope.org = org;
        $scope.cancel = cancel;
        $scope.ok = ok;

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function ok() {
            $uibModalInstance.close('ok');
        }
    }

    function grantMembershipModalCtrl($scope, $uibModalInstance, role, user) {
        $scope.user = user;
        $scope.role = role;
        $scope.cancel = cancel;
        $scope.ok = ok;

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function ok() {
            $uibModalInstance.close('ok');
        }
    }

    function rejectMembershipModalCtrl($scope, $uibModalInstance, user) {
        $scope.user = user;
        $scope.cancel = cancel;
        $scope.ok = ok;

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function ok() {
            $uibModalInstance.close('ok');
        }
    }

    // #end
})(window.angular);
