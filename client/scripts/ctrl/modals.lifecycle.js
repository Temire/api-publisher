;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals.lifecycle', [])

        /// ==== NewPlan Controller
        .controller('NewPlanCtrl',
            function ($scope, $uibModal, $state, $stateParams, orgScreenModel,
                      toastService, REGEX, TOAST_TYPES, Plan) {

                $scope.org = orgScreenModel.organization;
                $scope.createPlan = createPlan;
                $scope.regex = REGEX;
                $scope.modalClose = modalClose;

                function createPlan(plan) {
                    var newPlanObject = angular.copy(plan);
                    newPlanObject.name = plan.name.trim();
                    newPlanObject.initialVersion = 'v'.concat(plan.initialVersion);
                    Plan.save({orgId: $stateParams.orgId}, newPlanObject, function (newPlan) {
                        $scope.modalClose();
                        $state.go('root.plan',
                            {orgId: $stateParams.orgId, planId: newPlan.id, versionId: newPlanObject.initialVersion});
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Plan <b>' + newPlan.name + '</b> created!', true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                        }
                        toastService.createErrorToast(error, 'Could not create plan.');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            })

        /// ==== LockPlan Controller
        .controller('LockPlanCtrl',
            function ($scope, $uibModalInstance,
                      planVersion) {

                $scope.planVersion = planVersion;
                $scope.modalClose = modalClose;
                $scope.doLock = doLock;

                function modalClose() {
                    $uibModalInstance.dismiss('canceled');	// this method is associated with $uibModal scope which is this.
                }

                function doLock() {
                    $uibModalInstance.close('ok');
                }

            })

        /// ==== NewService Controller
        .controller('NewServiceCtrl',
            function ($scope, $filter, $uibModal, $state, $stateParams, flowFactory, alertService, service,
                      imageService, orgScreenModel, toastService, REGEX, TOAST_TYPES, CONFIG, Service, admin, branding,
                      BrandingService, _) {
                let controller = this;
                $scope.admin = admin;
                $scope.org = orgScreenModel.organization;
                $scope.configVars = CONFIG;
                $scope.imageService = imageService;
                $scope.alerts = alertService.alerts;
                $scope.flow = flowFactory.create({
                    singleFile: true
                });
                $scope.regex = REGEX;
                $scope.noBrandingText = 'No branding';
                $scope.readFile = readFile;
                $scope.closeAlert = closeAlert;
                $scope.createService = createService;
                $scope.filterCategories = filterCategories;
                $scope.modalClose = modalClose;
                $scope.addPath = addPath;
                $scope.removePath = removePath;
                $scope.resetImage = resetImage;
                $scope.selectBranding = selectBranding;
                init();


                function init() {

                    alertService.resetAllAlerts();
                    imageService.clear();

                    filterBrandings();

                    service.getAllCategories().then(function (reply) {
                        $scope.currentCategories = reply;
                    });
                }

                function addPath() {
                    controller.service.basepath.push({ val: '' });
                }

                function removePath(path) {
                    _.remove(controller.service.basepath, path);
                }

                function readFile($file) {
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

                function createService(svc, categories) {
                    var newSvcObject = angular.copy(svc);
                    newSvcObject.name = svc.name.trim();
                    newSvcObject.initialVersion = 'v'.concat(svc.initialVersion);
                    var cats = [];
                    for (var i = 0; i < categories.length; i++) {
                        cats.push(categories[i].text);
                    }
                    if (imageService.image.fileData) {
                        newSvcObject.base64logo = imageService.image.fileData;
                    } else {
                        newSvcObject.base64logo = '';
                    }
                    // var basePathStart = '/';
                    // newSvcObject.basepath = basePathStart.concat(svc.basepath);
                    newSvcObject.basepath = _.map(svc.basepath, 'val');
                    newSvcObject.categories = cats;

                    Service.save({orgId: $stateParams.orgId}, newSvcObject, function (newSvc) {
                        if ($scope.selectedBranding) {
                            BrandingService.addBrandingToService($stateParams.orgId, newSvc.id, $scope.selectedBranding).then(function () {
                                handleSuccess();
                            }, function (err) {
                                handleSuccess();
                                toastService.createErrorToast(err, 'Could not apply branding to service.');
                            })
                        } else {
                            handleSuccess();
                        }

                        function handleSuccess() {
                            $scope.modalClose();
                            imageService.clear();
                            $state.go('root.service.overview',
                                {orgId: $stateParams.orgId, svcId: newSvc.id, versionId: newSvcObject.initialVersion});
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Service <b>' + newSvc.name + '</b> created!', true);
                        }
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                        }
                        toastService.createErrorToast(error, 'Could not create service.');
                    });
                }

                function filterBrandings() {
                    var filtered = _.sortBy(_.filter(branding, function (b) {
                        if ($scope.selectedBranding) return b.id !== $scope.selectedBranding.id;
                        else return true;
                    }), 'name');

                    if ($scope.selectedBranding) $scope.branding = _.concat([{name: $scope.noBrandingText }], filtered);
                    else $scope.branding = filtered;
                }

                function filterCategories($query) {
                    return $filter('filter')($scope.currentCategories, $query);
                }

                function modalClose() {
                    imageService.clear();
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }

                function resetImage(flow) {
                    flow.cancel();
                    imageService.clear();
                    alertService.resetAllAlerts();
                }

                function selectBranding(branding) {
                    if (branding.name === $scope.noBrandingText) $scope.selectedBranding = undefined;
                    else $scope.selectedBranding = branding;
                    filterBrandings();
                }
            })

        /// ==== DeprecateService Controller
        .controller('DeprecateServiceCtrl',
            function ($scope, $uibModalInstance,
                      svcVersion, actionService) {

                $scope.serviceVersion = svcVersion;
                $scope.modalClose = modalClose;
                $scope.doDeprecate = doDeprecate;

                function modalClose() {
                    $uibModalInstance.dismiss('canceled');
                }

                function doDeprecate() {
                    actionService.deprecateService($scope.serviceVersion, false).then(function () {
                        $uibModalInstance.close('Deprecated');
                    });
                }

            })

        /// ==== PublishService Controller
        .controller('PublishServiceCtrl',
            function ($scope, $uibModalInstance,
                      svcVersion, actionService) {

                $scope.selectedSvcVersion = svcVersion;
                $scope.modalClose = modalClose;
                $scope.doPublish = doPublish;

                function modalClose() {
                    $uibModalInstance.dismiss('canceled');
                }

                function doPublish() {
                    actionService.publishService($scope.selectedSvcVersion, false).then(function () {
                        $uibModalInstance.close('Published');
                    });
                }

            })

        /// ==== RetireService Controller
        .controller('RetireServiceCtrl',
            function ($scope, $uibModalInstance,
                      svcVersion, actionService, toastService, TOAST_TYPES) {

                $scope.serviceVersion = svcVersion;
                $scope.modalClose = modalClose;
                $scope.doDeprecate = doDeprecate;
                $scope.doRetire = doRetire;

                function modalClose() {
                    $uibModalInstance.dismiss('canceled');
                }

                function doDeprecate() {
                    actionService.deprecateService($scope.serviceVersion, false).then(function () {
                        $uibModalInstance.close('Deprecated');
                    });
                }

                function doRetire() {
                    actionService.retireService($scope.serviceVersion, false).then(function () {
                        $uibModalInstance.close('Retired');
                    }, function (err) {
                        if (err.status === 409) { // BE returns 409 Conflict in case of existing contracts
                            toastService.createToast(TOAST_TYPES.WARNING, '<b>This service has existing contracts!</b>', true);
                            $scope.hasExistingContracts = true;
                        }
                    });
                }

            })

        /// ==== DeleteService Controller
        .controller('DeleteServiceCtrl',
            function ($scope, $uibModalInstance, organizationId, serviceId, serviceName, actionService) {

                $scope.serviceName = serviceName;
                $scope.modalClose = modalClose;
                $scope.doDelete = doDelete;

                function modalClose() {
                    $uibModalInstance.dismiss("cancel");
                }

                function doDelete() {
                    actionService.deleteSvc(organizationId, serviceId, serviceName).then(function (success) {
                        $uibModalInstance.close("success");
                    }, function (fail) {
                        $uibModalInstance.close("fail");
                    })
                }
            })

        /// ==== DeleteServiceVersion Controller
        .controller('DeleteServiceVersionCtrl',
            function ($scope, $uibModalInstance, svcVersion, lastVersion, ServiceVersion) {

                $scope.serviceVersion = svcVersion;
                $scope.lastVersion = lastVersion;
                $scope.modalClose = modalClose;
                $scope.doDelete = doDelete;

                function modalClose() {
                    $uibModalInstance.dismiss('canceled');
                }

                function doDelete() {
                    ServiceVersion.delete({ orgId: svcVersion.service.organization.id,
                        svcId: svcVersion.service.id, versionId: svcVersion.version }).$promise.then(function () {
                        $uibModalInstance.close("success");
                    }, function (err) {
                        $uibModalInstance.close(err);
                    });
                }
            })

        /// ==== NewVersion Controller
        .controller('NewVersionCtrl',
            function ($scope, $state, $stateParams, appScreenModel, planScreenModel, svcScreenModel, toastService,
                      ApplicationVersion, PlanVersion, ServiceVersion, REGEX) {

                $scope.newVersion = '';
                $scope.shouldClone = true;
                $scope.createVersion = createVersion;
                $scope.modalClose = modalClose;
                $scope.regex = REGEX;

                var type = {};
                init();

                function init() {
                    if (angular.isUndefined($stateParams.appId) && angular.isUndefined($stateParams.svcId)) {
                        type = 'Plan';
                        $scope.currentVersion = planScreenModel.plan.version;
                    } else if (angular.isUndefined($stateParams.planId) && angular.isUndefined($stateParams.svcId)) {
                        type = 'Application';
                        $scope.currentVersion = appScreenModel.application.version;
                    } else {
                        type = 'Service';
                        $scope.currentVersion = svcScreenModel.service.version;
                    }
                }

                function createVersion() {
                    var newVersion = {
                        version: 'v'.concat($scope.newVersion),
                        clone: $scope.shouldClone,
                        cloneVersion: $scope.currentVersion
                    };

                    switch (type) {
                        case 'Application':
                            ApplicationVersion.save({orgId: $stateParams.orgId, appId: $stateParams.appId}, newVersion,
                                function (newAppVersion) {
                                    $scope.modalClose();
                                    $state.go('root.application.overview',
                                        {orgId: $stateParams.orgId,
                                            appId: newAppVersion.application.id,
                                            versionId: newAppVersion.version});
                                }, function (error) {
                                    handleError(error, 'application');
                                });
                            break;
                        case 'Plan':
                            PlanVersion.save(
                                {orgId: $stateParams.orgId, planId: $stateParams.planId}, newVersion,
                                function (newPlanVersion) {
                                    $scope.modalClose();
                                    $state.go('root.plan',
                                        {orgId: $stateParams.orgId,
                                            planId: newPlanVersion.plan.id,
                                            versionId: newPlanVersion.version});
                                }, function (error) {
                                    handleError(error, 'plan');
                                });
                            break;
                        case 'Service':
                            ServiceVersion.save(
                                {orgId: $stateParams.orgId, svcId: $stateParams.svcId}, newVersion,
                                function (newSvcVersion) {
                                    $scope.modalClose();
                                    $state.go('root.service.overview',
                                        {orgId: $stateParams.orgId,
                                            svcId: newSvcVersion.service.id,
                                            versionId: newSvcVersion.version});
                                }, function (error) {
                                    handleError(error, 'service');
                                });
                            break;
                    }
                }

                function handleError(error, type) {
                    if (error.status !== 409) {
                        $scope.modalClose();
                    }
                    toastService.createErrorToast(error, 'Could not create new ' + type + ' version.');
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }

            })

        /// ==== NewOrganization Controller
        .controller('NewOrganizationCtrl',
            function ($scope, $uibModal, $state, admin,
                      currentUserModel, toastService, CONFIG, REGEX, TOAST_TYPES, Organization) {

                $scope.admin = admin;
                $scope.createOrganization = createOrganization;
                $scope.modalClose = modalClose;
                $scope.regex = REGEX;
                $scope.useFriendlyNames = CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED;

                // New organization defaults to Private
                $scope.organization = {
                    organizationPrivate: true
                };

                function createOrganization() {
                    $scope.organization.name = $scope.organization.name.trim();

                    if ($scope.organization.friendlyName) {
                        $scope.organization.friendlyName = $scope.organization.friendlyName.trim();
                    }

                    Organization.save($scope.organization, function (newOrg) {
                        currentUserModel.refreshCurrentUserInfo(currentUserModel);
                        $scope.modalClose();
                        $state.go('root.organization', {orgId: newOrg.id});
                        toastService.createToast(
                            TOAST_TYPES.SUCCESS,
                            'Organization <b>' + newOrg.name + '</b> created!',
                            true);
                    }, function (error) {
                        if (error.status !== 409) {
                            $scope.modalClose();
                            $state.go('root.myOrganizations');
                        }
                        toastService.createErrorToast(error, 'Could not create organization.');
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }
            });

    // #end
})(window.angular);
