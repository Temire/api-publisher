(function () {
    'use strict';

    angular.module('app.organizations')
        .controller('ApplicationsCtrl', applicationsCtrl)
        .controller('MembersCtrl', membersCtrl)
        .controller('MyOrganizationsCtrl', myOrganizationsCtrl)
        .controller('OrganizationCtrl', organizationCtrl)
        .controller('OrganizationsCtrl', organizationsCtrl)
        .controller('OrgFriendlyNameModalCtrl', orgFriendlyNameModalCtrl)
        .controller('OrgVisibilityModalCtrl', orgVisibilityModalCtrl)
        .controller('PendingCtrl', pendingMembersCtrl)
        .controller('PlansCtrl', plansCtrl)
        .controller('ServicesCtrl', servicesCtrl)
        .controller('OrgDeleteCtrl', orgDeleteCtrl)
        .controller('OrgEditCtrl', orgEditCtrl);


    function applicationsCtrl($scope, $state, appData, orgScreenModel, ApplicationVersion) {

        $scope.applications = appData;
        $scope.goToApp = goToApp;

        orgScreenModel.updateTab('Applications');

        function goToApp(app) {
            ApplicationVersion.query({orgId: app.organizationId, appId: app.id}, function (versions) {
                $state.go('root.application.overview',
                    {orgId: app.organizationId, appId: app.id, versionId: versions[0].version});
            });
        }

    }

    function membersCtrl($scope, $stateParams, memberData, roleData, orgScreenModel, memberHelper) {
        $scope.addMember = addMember;
        $scope.members = memberData;
        $scope.orgId = $stateParams.orgId;
        $scope.roles = roleData;

        orgScreenModel.updateTab('Members');

        function addMember() {
            memberHelper.addMember($scope.org, $scope.roles);
        }
    }

    function myOrganizationsCtrl($scope, $stateParams, $uibModal, filterFilter, svcOrgData, toastService, headerModel) {

        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.modalNewOrganization = modalNewOrganization;

        init();

        function init() {
            headerModel.setIsButtonVisible(false, false, false);

            $scope.orgs = svcOrgData;
            $scope.orgs.forEach(function (org) {
                org.isMember = true;
            });

            if ($stateParams.mode && $stateParams.mode === 'create') {
                modalNewOrganization();
            }
        }

        $scope.$watch('searchText', function (newVal) {
            $scope.filteredOrgs = filterFilter($scope.orgs, {name: newVal});
        });

        function modalNewOrganization() {
            $uibModal.open({
                templateUrl: 'views/modals/organizationCreate.html',
                size: 'lg',
                controller: 'NewOrganizationCtrl as ctrl',
                resolve: {
                    admin: function () {
                        return $scope.User.currentUser.admin
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

    }

    function organizationsCtrl($scope, orgs, svcOrgData, pendingOrgs, orgService, toastService, _) {

        $scope.doSearch = doSearch;
        $scope.orgNameRegex = '\\w+';
        init();

        function init() {
            $scope.memberOrgs = svcOrgData;
            $scope.pendingOrgs = pendingOrgs;
            $scope.orgs = processResults(orgs.beans);
            $scope.totalOrgs = orgs.totalSize;
        }

        function doSearch(searchString) {

            orgService.search(searchString).then(function (results) {
                $scope.totalOrgs = results.totalSize;
                results.beans.forEach(function (org) {
                    for (var i = 0; i < $scope.memberOrgs.length; i++) {
                        if ($scope.memberOrgs[i].id === org.id) {
                            org.isMember = true;
                        }
                    }
                    if(typeof pendingOrgs !== "undefined"){
                        for (var j = 0; j < $scope.pendingOrgs.length; j++) {
                            if ($scope.pendingOrgs[j].id === org.id) {
                                org.requestPending = true;
                            }
                        }
                    }
                });
                $scope.orgs = processResults(results.beans);
            }, function (error) {
                toastService.warning('<b>Could not complete search!</b><br><span class="small">An error occurred while executing the search. Please try again later.</span>');
            });
        }

        function processResults(orgs) {
            var processedOrgs = _.differenceWith(orgs, $scope.memberOrgs, function (a, b) {
                return a.id === b.id;
            });
            processedOrgs.forEach(function (org) {
                // check for pending membership
                for (var j = 0; j < $scope.pendingOrgs.length; j++){
                    if ($scope.pendingOrgs[j].id === org.id) {
                        org.requestPending = true;
                        break;
                    }
                }
            });
            return processedOrgs;
        }
    }

    function organizationCtrl($scope, $state, $stateParams, screenSize, orgData, pendingContracts,
                              pendingMemberships, memberService, orgService, toastService, Member,
                              orgScreenModel, CONFIG) {

        $scope.displayTab = orgScreenModel;
        $scope.org = orgData;
        $scope.pendingMemberships = pendingMemberships;
        $scope.pendingContracts = pendingContracts;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.xs = screenSize.on('xs', function(match) {
            $scope.xs = match;
        });
        $scope.deleteOrg = deleteOrg;
        $scope.editDetails = editDetails;
        $scope.useFriendlyNames = CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED;
        init();

        function init() {
            orgScreenModel.updateOrganization(orgData);
            Member.query({orgId: $scope.org.id}, function (reply) {
                $scope.memberCount = reply.length;
            });
        }

        function deleteOrg() {
            orgService.delete($stateParams.orgId).then(function (reply) {
                if (reply != 'canceled') {
                    toastService.info('<b>' + $scope.orgScreenModel.organization.name + ' has been deleted!</b>');
                    $state.go('root.myOrganizations');
                }
            }, function (error) {
                toastService.createErrorToast(error, 'Could not delete organization');
            })
        }


        function editDetails() {
            orgService.editDetails($stateParams.orgId).then(function (reply) {
                if (reply != 'canceled') {
                    toastService.info('Settings for <b>' + $scope.org.name + '</b> have been updated.');
                    // todo avoid forced reload?
                    $state.forceReload();
                }
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update organization details');
            })
        }
    }

    function pendingMembersCtrl($scope, $stateParams, orgScreenModel) {
        $scope.orgId = $stateParams.orgId;
        orgScreenModel.updateTab('Pending');
    }

    function plansCtrl($scope, $uibModal, planData, orgScreenModel, PlanVersion, actionService, _) {

        $scope.plans = planData;
        $scope.modalAnim = 'default';
        $scope.canLock = canLock;
        $scope.confirmLockPlan = confirmLockPlan;
        $scope.modalNewPlan = modalNewPlan;
        $scope.selectVersion = selectVersion;

        
        init();
        
        function init() {
            orgScreenModel.updateTab('Plans');
            angular.forEach($scope.plans, function (plan) {
                plan.selectedVersionIndex = 0;
            })
        }

        function modalNewPlan() {
            $uibModal.open({
                templateUrl: 'views/modals/planCreate.html',
                size: 'lg',
                controller: 'NewPlanCtrl as ctrl',
                resolve: function() {},
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

        function canLock(planVersion) {
            return planVersion.status === 'Created';
        }

        function confirmLockPlan(planVersion) {
            PlanVersion.get(
                {orgId: planVersion.organizationId, planId: planVersion.id, versionId: planVersion.version},
                function (retrievedPlanVersion) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'views/modals/planLock.html',
                        size: 'lg',
                        controller: 'LockPlanCtrl as ctrl',
                        resolve: {
                            planVersion: function () {
                                return retrievedPlanVersion;
                            }
                        },
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                    modalInstance.result.then(function () {
                        actionService.lockPlan(retrievedPlanVersion, false).then(function () {
                            planVersion.status = 'Locked';
                        });
                    })
                });
        }

        function selectVersion(plan, version) {
            plan.selectedVersionIndex = _.indexOf(plan.versions, version);
        }

    }

    function orgFriendlyNameModalCtrl($scope, $uibModalInstance, orgFriendlyName, REGEX) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.orgFriendlyName = angular.copy(orgFriendlyName);
        $scope.regex = REGEX;


        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close($scope.orgFriendlyName);
        }
    }

    function orgVisibilityModalCtrl($scope, $uibModalInstance, currentlyPrivate) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.currentlyPrivate = currentlyPrivate;
        $scope.setPrivate = currentlyPrivate;


        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close($scope.setPrivate);
        }
    }

    function orgDeleteCtrl($scope, $uibModalInstance, org) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.org = org;

        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close();
        }
    }

    function orgEditCtrl($scope, $uibModalInstance, org, admin) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.org = org;
        $scope.admin = admin;

        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close($scope.org);
        }
    }

    function servicesCtrl($scope, $state, $uibModal, svcData, _, toastService,
                          orgScreenModel, service, BrandingService) {

        $scope.services = svcData;
        $scope.canDeprecate = canDeprecate;
        $scope.canPublish = canPublish;
        $scope.canRetire = canRetire;
        $scope.confirmDeleteSvc = confirmDeleteSvc;
        $scope.confirmDeleteSvcVersion = confirmDeleteSvcVersion;
        $scope.confirmDeprecateSvc = confirmDeprecateSvc;
        $scope.confirmPublishSvc = confirmPublishSvc;
        $scope.confirmRetireSvc = confirmRetireSvc;
        $scope.toMetrics = toMetrics;
        $scope.modalNewService = modalNewService;
        $scope.selectVersion = selectVersion;


        init();

        function init() {
            orgScreenModel.updateTab('Services');

            angular.forEach($scope.services, function (service) {
                service.selectedVersionIndex = 0;
            });

            // Find services with pending contracts
            angular.forEach($scope.pendingContracts, function (pendingContract) {
                for (var i = 0; i < $scope.services.length; i++) {
                    var svc = $scope.services[i];
                    if (_.find(svc.versions, function (v) {
                            return pendingContract.serviceOrg === v.organizationId &&
                                    pendingContract.serviceId === v.id &&
                                    pendingContract.serviceVersion === v.version;
                    })) {
                        svc.hasPendingContracts = true;
                        break;
                    }
                }
            })
        }

        function modalNewService() {
            $uibModal.open({
                templateUrl: 'views/modals/serviceCreate.html',
                size: 'lg',
                controller: 'NewServiceCtrl as ctrl',
                resolve: {
                    admin: function () {
                        return $scope.User.currentUser.admin
                    },
                    branding : function () {
                        return BrandingService.getBrandings();
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

        function canPublish(svcVersion) {
            return svcVersion.status === 'Ready';
        }

        function canDeprecate(svcVersion) {
            return svcVersion.status === 'Published'
        }

        function canRetire(svcVersion) {
            return svcVersion.status === 'Published' || svcVersion.status === 'Deprecated';
        }

        function confirmDeleteSvc(svcVersion) {
            service.deleteService(svcVersion.organizationId, svcVersion.id, svcVersion.name);
        }
        
        function confirmDeleteSvcVersion(svcVersion) {
            service.deleteServiceVersion(svcVersion.organizationId, svcVersion.id, svcVersion.version).then(function (result) {
                if ( result === 'success') {
                    $state.forceReload();
                } else {
                    toastService.createErrorToast(result, 'Could not delete service version!');
                }
            });
        }

        function confirmDeprecateSvc(svcVersion) {
            service.deprecateServiceVersion(svcVersion.organizationId, svcVersion.id, svcVersion.version).then(function (status) {
                svcVersion.status = status;
            });
        }

        function confirmPublishSvc(svcVersion) {
            service.publishServiceVersion(svcVersion.organizationId, svcVersion.id, svcVersion.version).then(function (status) {
                svcVersion.status = status;
            });
        }

        function confirmRetireSvc(svcVersion) {
            service.retireServiceVersion(svcVersion.organizationId, svcVersion.id, svcVersion.version).then(function (status) {
                svcVersion.status = status;
            });
        }

        function toMetrics(svcVersion) {
            $state.go('root.service.metrics',
                {orgId: svcVersion.organizationId, svcId: svcVersion.id, versionId: svcVersion.version});
        }

        function selectVersion(service, version) {
            service.selectedVersionIndex = _.indexOf(service.versions, version);
        }

    }

})();

