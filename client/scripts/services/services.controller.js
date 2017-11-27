(function () {
    'use strict';

    angular.module('app.service')
           .controller('ServiceCtrl', serviceCtrl)
           .controller('ServiceActivityCtrl', serviceActivityCtrl)
           .controller('ServiceImplementationCtrl', serviceImplCtrl)
           .controller('ServiceDefinitionCtrl', serviceDefinitionCtrl)
           .controller('ServiceEditCtrl', serviceEditCtrl)
           .controller('ServicePendingContractsCtrl', servicePendingCtrl)
           .controller('ServicePlansCtrl', servicePlansCtrl)
           .controller('ServiceScopeCtrl', serviceScopeCtrl)
           .controller('ServicePoliciesCtrl', servicePoliciesCtrl)
           .controller('ServiceTermsCtrl', serviceTermsCtrl)
           .controller('ServiceReadmeCtrl', serviceReadmeCtrl)
           .controller('ServiceAnnouncementsCtrl', serviceAnnouncementsCtrl)
           .controller('ServiceSupportCtrl', serviceSupportCtrl)
           .controller('ServiceOverviewCtrl', serviceOverviewCtrl)
           .controller('ServiceMetricsController', serviceMetricsCtrl);


    function serviceCtrl($scope, $state, $stateParams, $uibModal, orgData, orgScreenModel, support,
                         svcData, endpoint, svcVersions, svcScreenModel, resourceUtil, alertService, contractService,
                         toastService, ALERT_TYPES, TOAST_TYPES, service, CONFIG) {

        orgScreenModel.updateOrganization(orgData);
        $scope.serviceVersion = svcData;
        $scope.endpoint = endpoint;
        $scope.orgId = $stateParams.orgId;
        $scope.userHasEditPermission = $scope.User.isAuthorizedForIn('svcEdit', $scope.orgId);
        $scope.userHasAdminPermission = $scope.User.isAuthorizedForIn('svcAdmin', $scope.orgId);
        svcScreenModel.updateService(svcData);
        $scope.displayTab = svcScreenModel;
        $scope.versions = svcVersions;
        $scope.support = support;
        $scope.isDeprecated = $scope.serviceVersion.status === 'Deprecated';
        $scope.isReady = $scope.serviceVersion.status === 'Ready';
        $scope.isPublished =
            $scope.serviceVersion.status === 'Published' || $scope.serviceVersion.status === 'Deprecated';
        $scope.isRetired = $scope.serviceVersion.status === 'Retired';
        $scope.isAdminService = $scope.serviceVersion.service.admin;
        $scope.tabStatus = svcScreenModel.tabStatus;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.confirmDeleteSvc = confirmDeleteSvc;
        $scope.confirmDeleteSvcVersion = confirmDeleteSvcVersion;
        $scope.confirmDeprecateSvc = confirmDeprecateSvc;
        $scope.confirmPublishSvc = confirmPublishSvc;
        $scope.confirmRetireSvc = confirmRetireSvc;
        $scope.editDetails = editDetails;
        $scope.selectVersion = selectVersion;
        $scope.showInfoModal = showInfoModal;
        $scope.updateDesc = updateDesc;
        $scope.CONFIG = CONFIG;

        init();


        function init() {
            if ($scope.serviceVersion.plans.length > 0) svcScreenModel.setHasPlan(true);
            else svcScreenModel.setHasPlan(false);

            service.getDefinition($stateParams.orgId, $stateParams.svcId, $stateParams.versionId).then(function (reply) {
                // Clean the reply so we have the pure data object, then
                // Check number of properties in the object, if 0, there is no definition present
                if (Object.keys(resourceUtil.cleanResponse(reply)).length > 0) {
                    svcScreenModel.setHasDefinition(true);
                } else {
                    svcScreenModel.setHasDefinition(false);
                }
            }, function (error) {
                svcScreenModel.setHasDefinition(false);
            });


            // Check for pending contracts if the user is authorized to see them
            if ($scope.User.isAuthorizedFor('svcEdit')) {
                contractService.getPendingForSvc($stateParams.orgId, $stateParams.svcId, $stateParams.versionId)
                               .then(function (contracts) {
                                   $scope.pendingContracts = contracts;
                               })
            } else {
                $scope.pendingContracts = [];
            }
            // Check if user is authorized to accept or reject contracts
            $scope.canAccept = !!$scope.User.isAuthorizedFor('svcAdmin');
            checkNeedsReadMe();
        }

        function confirmDeleteSvc() {
            service.deleteService($scope.serviceVersion.service.organization.id,
                $scope.serviceVersion.service.id, $scope.serviceVersion.service.name).then(function (result) {
                if (result === 'success') {
                    $state.go('root.organization.services', {orgId: $scope.serviceVersion.service.organization.id});
                }
            });
        }

        function confirmDeleteSvcVersion() {
            service.deleteServiceVersion($scope.serviceVersion.service.organization.id, $scope.serviceVersion.service.id, $scope.serviceVersion.version).then(function (result) {
                if (result === 'success') {
                    $state.go('root.organization.services', { orgId: $scope.serviceVersion.service.organization.id });
                } else {
                    toastService.createErrorToast(result, 'Could not delete service version!');
                }
            })
        }

        function confirmDeprecateSvc() {
            service.deprecateServiceVersion($scope.serviceVersion.service.organization.id,
                $scope.serviceVersion.service.id, $scope.serviceVersion.version).then(function () {
                $state.forceReload();
            });
        }

        function confirmPublishSvc() {
            if (checkNeedsReadMe()) {
                toastService.warning('<b>No README found!</b><br><span class="text-light">Cannot publish the service without a README file.</span>')
            } else {
                service.publishServiceVersion($scope.serviceVersion.service.organization.id,
                    $scope.serviceVersion.service.id, $scope.serviceVersion.version).then(function () {
                    $state.forceReload();
                });
            }
        }

        function confirmRetireSvc() {
            service.retireServiceVersion($scope.serviceVersion.service.organization.id,
                $scope.serviceVersion.service.id, $scope.serviceVersion.version).then(function () {
                $state.forceReload();
            });
        }

        function checkNeedsReadMe() {
            alertService.resetAllAlerts();
            let needsReadMe = !$scope.serviceVersion.autoAcceptContracts &&
                              (!$scope.serviceVersion.readme || $scope.serviceVersion.readme.length === 0);
            if (needsReadMe) {
                alertService.addAlert(ALERT_TYPES.INFO,
                    '<b>Please provide a README file!</b><br><span class="small text-light">You have indicated that you want to manually manage the' +
                    ' contracts for this service, but no README has been found.' +
                    ' Please update the README to include steps developers need to take' +
                    ' to get their contract request approved (how to contact you, information to provide, etc...).' +
                    ' Without a README you will not be able to publish the service!</span>');
            }
            return needsReadMe;
        }

        function editDetails() {
            service.editDetails($scope.serviceVersion.service.organization.id, $scope.serviceVersion.service.id).then(function (reply) {
                if (reply !== 'canceled') {
                    toastService.info('Details for <b>' + $scope.serviceVersion.service.name + '</b> have been updated.');
                    // todo avoid forced reload?
                    $state.forceReload();
                }
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update service version details');
            })
        }

        function updateDesc(newValue) {
            service.updateDescription($stateParams.orgId, $stateParams.svcId, newValue).then(function (reply) {
                toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update service\'s description.');
            });
        }

        function selectVersion(version) {
            $state.go($state.$current.name,
                {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: version.version});
        }

        function showInfoModal() {
            $uibModal.open({
                templateUrl: 'views/modals/helpView.html',
                size: 'lg',
                controller: 'HelpCtrl as ctrl',
                resolve: {
                    type: function () {
                        return 'service';
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

    }

    function servicePendingCtrl($scope, svcScreenModel) {
        svcScreenModel.updateTab('Pending');
    }

    function serviceActivityCtrl($scope, activityData, svcScreenModel) {

        $scope.activities = activityData.beans;
        svcScreenModel.updateTab('Activity');

    }


    function serviceEditCtrl($scope, $filter, $uibModalInstance, svc, branding, service, _) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.filterCategories = filterCategories;
        $scope.selectBranding = selectBranding;
        $scope.svc = svc;
        $scope.noBrandingText = 'No branding';

        init();

        function init() {
            if (!_.isEmpty($scope.svc.brandings)) $scope.svc.selectedBranding = $scope.svc.brandings[0];
            filterBrandings();

            service.getAllCategories().then(function (reply) {
                $scope.currentCategories = reply;
            })
        }

        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function filterBrandings() {
            var filtered = _.sortBy(_.filter(branding, function (b) {
                if ($scope.svc.selectedBranding) return b.id !== $scope.svc.selectedBranding.id;
                else return true;
            }), 'name');

            if ($scope.svc.selectedBranding && $scope.svc.selectedBranding.name !== $scope.noBrandingText) $scope.branding = _.concat([{name: $scope.noBrandingText }], filtered);
            else $scope.branding = filtered;
        }

        function filterCategories($query) {
            return $filter('filter')($scope.currentCategories, $query);
        }

        function ok() {
            $uibModalInstance.close($scope.svc);
        }

        function selectBranding(branding) {
            $scope.svc.selectedBranding = branding;
            filterBrandings();
        }
    }


    function serviceImplCtrl($q, $scope, $state, $stateParams, toastService, TOAST_TYPES, REGEX, svcScreenModel, service, svcData, targets, _) {

        $scope.serviceVersion = svcData;
        let existingTargets = angular.copy(targets);
        if (targets && targets.length) {
            $scope.targets = targets;
        } else {
            $scope.targets = [{ target: '', port: 8000 }];
        }
        $scope.updatedService = {
            gateways: [{gatewayId: 'KongGateway'}],
            endpointType: 'rest',
            upstreamConnectTimeout: $scope.serviceVersion.upstreamConnectTimeout || 60000,
            upstreamReadTimeout: $scope.serviceVersion.upstreamReadTimeout || 60000,
            upstreamSendTimeout: $scope.serviceVersion.upstreamSendTimeout || 60000,
            upstreamScheme: $scope.serviceVersion.upstreamScheme || 'HTTPS',
            upstreamPath: $scope.serviceVersion.upstreamPath || '',
        };
        svcScreenModel.updateService(svcData);
        $scope.contextPathRegex = REGEX.CONTEXTPATH;
        $scope.domainRegex = REGEX.DOMAIN_OR_IP;
        // $scope.implementationRegex = REGEX.IMPLEMENTATION;
        $scope.timeoutRegex = REGEX.POSITIVE_INTEGER;
        $scope.version = svcScreenModel.service;

        $scope.typeOptions = ['rest'];
        svcScreenModel.updateTab('Implementation');

        $scope.selectType = function (newType) {
            $scope.updatedService.endpointType = newType;
        };

        function checkValid() {
            let valid = true;
            // needs scheme
            if (!$scope.updatedService.upstreamScheme || angular.isUndefined($scope.updatedService.upstreamScheme)) { valid = false; }
            // needs context path
            if (!$scope.updatedService.upstreamPath || angular.isUndefined($scope.updatedService.upstreamPath)) { valid = false; }
            // needs at least 1 target + port
            if (!$scope.targets || !$scope.targets.length) { valid = false; }
            // timeouts?
            $scope.isValid = valid;
        }

        $scope.$watch('updatedService', function () {
            checkChanges();
        }, true);

        $scope.$watch('targets', function () {
            checkChanges();
        }, true);

        function checkChanges() {
            if ($scope.version) {
                let dirty = false;
                if ($scope.updatedService.upstreamScheme !== $scope.version.upstreamScheme ||
                    $scope.updatedService.upstreamPath !== $scope.version.upstreamPath ||
                    $scope.updatedService.upstreamConnectTimeout !== $scope.version.upstreamConnectTimeout ||
                    $scope.updatedService.upstreamReadTimeout !== $scope.version.upstreamReadTimeout ||
                    $scope.updatedService.upstreamSendTimeout !== $scope.version.upstreamSendTimeout ||
                    !_.isEqual($scope.targets, existingTargets)) {
                    dirty = true;
                }
                checkValid();
                $scope.isDirty = dirty;
            }
        }

        $scope.reset = function () {
            $scope.updatedService.upstreamConnectTimeout = $scope.version.upstreamConnectTimeout || 60000;
            $scope.updatedService.upstreamReadTimeout = $scope.serviceVersion.upstreamReadTimeout || 60000;
            $scope.updatedService.upstreamSendTimeout = $scope.serviceVersion.upstreamSendTimeout || 60000;
            $scope.updatedService.upstreamScheme = $scope.serviceVersion.upstreamScheme || 'HTTPS';
            $scope.updatedService.upstreamPath=  $scope.serviceVersion.upstreamPath || '';
            if (existingTargets && existingTargets.length) {
                $scope.targets = angular.copy(existingTargets);
            } else {
                $scope.targets = [{ target: '', port: 8000 }];
            }
            $scope.isDirty = false;
        };

        $scope.saveService = function () {
            // remove all existing targets
            let removePromises = [];
            _.forEach(existingTargets, target => {
                removePromises.push(service.removeVersionUpstream($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, target));
            });
            $q.all(removePromises).then(() => {
                // add new targets
                let addPromises = [];
                _.forEach($scope.targets, target => {
                    addPromises.push(service.addVersionUpstream($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, target));
                });
                return $q.all(addPromises).then(results => {
                    // save service
                    return service.updateServiceVersion($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, $scope.updatedService).then(
                        function () {
                            // update upstreams
                            toastService.createToast(TOAST_TYPES.SUCCESS,
                                'Implementation settings for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                                true);
                            $scope.isDirty = false;
                            if ($scope.tabStatus.hasImplementation) {
                                $state.forceReload();
                            } else {
                                svcScreenModel.setHasImplementation(true);
                                $state.go('^.definition');
                            }
                        });
                });
            }).catch(error => {
                toastService.createErrorToast(error, 'Could not update service implementation settings.');
            });



        };
        $scope.selectScheme = selectScheme;
        $scope.addTarget = addTarget;
        $scope.removeTarget = removeTarget;


        function addTarget() {
            $scope.targets.push({ target: '', port: 8000 });
        }

        function removeTarget(target) {
            if ($scope.targets.length > 1) { _.remove($scope.targets, target); }
            else { toastService.warning('At least one target must be defined!'); }
        }

        function selectScheme(newScheme) {
            $scope.updatedService.upstreamScheme = newScheme;
        }

    }

    function serviceDefinitionCtrl($scope, $state, $stateParams, $timeout, resourceUtil, toastService, TOAST_TYPES,
                                   docDownloader, SwaggerDocFetch, svcScreenModel, service) {

        svcScreenModel.updateTab('Definition');
        $scope.selectedMethod = 'JSON File';
        $scope.definitionLoaded = false;
        $scope.noDefinition = false;
        $scope.doDownload = doDownload;
        $scope.doFetch = doFetch;
        $scope.loadDefinition = loadDefinition;
        $scope.reset = reset;
        $scope.saveDefinition = saveDefinition;
        $scope.selectMethod = selectMethod;
        $scope.isSubmitting = false;

        init();

        function init() {
            $scope.isLoading = true;
            service.getDefinition($stateParams.orgId, $stateParams.svcId, $stateParams.versionId).then(
                function (reply) {
                    // Clean the reply so we have the pure data object
                    var cleanReply = resourceUtil.cleanResponse(reply);
                    // Check number of properties in the object, if 0, there is no definition present
                    if (Object.keys(cleanReply).length > 0) {
                        $scope.currentDefinition = cleanReply;
                        $scope.updatedDefinition = $scope.currentDefinition;
                        $scope.displayDefinition = angular.copy($scope.currentDefinition);
                        $timeout(function () {
                            $scope.isLoading = false;
                        }, 100);
                    } else {
                        $scope.noDefinition = true;
                        $scope.isLoading = false;
                    }
                }, function (error) {
                    $scope.noDefinition = true;
                    $scope.isLoading = false;
                });

        }

        function doDownload() {
            docDownloader.fetch($stateParams.orgId, $stateParams.svcId, $stateParams.versionId);
        }

        function doFetch(uri) {
            $scope.isLoading = true;
            var swaggerDocObj = {
                swaggerURI: uri
            };
            SwaggerDocFetch.save({}, swaggerDocObj, function (reply) {
                $scope.isLoading = false;
                $scope.result = 'success';
                loadDefinition(angular.fromJson(reply.swaggerDoc));
            }, function (error) {
                $scope.isLoading = false;
                $scope.result = 'error';
                toastService.warning('<b>Could not retrieve a Swagger JSON.</b><br><span class="small">Please double-check the URL.</span>')
            });
        }

        function loadDefinition($fileContent) {
            $scope.isLoading = true;
            $timeout(function() {
                try {
                    $scope.updatedDefinition = angular.fromJson($fileContent);
                    $scope.displayDefinition = angular.copy($scope.updatedDefinition);
                    $scope.noDefinition = false;
                    $scope.definitionLoaded = true;
                    $scope.isLoading = false;
                } catch (err) {
                    $scope.isLoading = false;
                    toastService.warning("<b>Error parsing Swagger JSON!</b>" +
                                         "<br><span class='small'>Encountered an error while parsing the Swagger definition." +
                                         "<br>Please double-check your JSON syntax.</span>" +
                                         "<br><span class='small'><b>" + err + '</b></span>');
                }
            }, 500);

        }

        function reset() {
            $scope.definitionLoaded = false;
            $scope.updatedDefinition = $scope.currentDefinition;
            if ($scope.currentDefinition) $scope.displayDefinition = angular.copy($scope.currentDefinition);
            else $scope.noDefinition = true;
            // TODO find better way to clear the input fields
            angular.element("input[type='file']").val(null);
            angular.element("input[type='url']").val(null);
        }

        function saveDefinition() {
            service.updateDefinition($stateParams.orgId, $stateParams.svcId, $stateParams.versionId,
                $scope.updatedDefinition).then(
                function (data) {
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Service Definition for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                    if ($scope.tabStatus.hasDefinition && $scope.tabStatus.hasPlan) {
                        $state.forceReload();
                    } else {
                        svcScreenModel.setHasDefinition(true);
                        $state.go('^.plans');
                    }
                },
                function (error) {
                    toastService.createErrorToast(error, 'Could not update the definition.');
                });
        }

        function selectMethod(method) {
            $scope.selectedMethod = method;
        }

        $scope.$watch('updatedDefinition', function (def) {
            $scope.changed = (def !== $scope.currentDefinition);
            $scope.invalid = def === undefined;
        }, true);
    }

    function servicePlansCtrl($scope, $state, $stateParams, $q, planData, svcScreenModel, service,
                              toastService, TOAST_TYPES, PlanVersion) {

        var definedPlans = planData;
        var lockedPlans = [];
        $scope.updatedService = {};
        $scope.reset = reset;
        $scope.saveService = saveService;
        $scope.version = svcScreenModel.service;

        init();

        $scope.$watch('plans', function (newValue) {
            $scope.updatedService.plans = getSelectedPlans();
        }, true);

        $scope.$watch('updatedService', function (newValue) {
            var dirty = false;
            if (newValue.autoAcceptContracts != $scope.version.autoAcceptContracts) dirty = true;
            if (newValue.termsAgreementRequired != $scope.version.termsAgreementRequired) dirty = true;
            if (newValue.plans && $scope.version.plans &&
                newValue.plans.length !== $scope.version.plans.length) {
                dirty = true;
            } else if (newValue.plans && $scope.version.plans) {
                for (var i = 0; i < $scope.version.plans.length; i++) {
                    var p1 = $scope.version.plans[i];

                    for (var j = 0; j < newValue.plans.length; j++) {
                        var p2 = newValue.plans[j];
                        if (p1.planId === p2.planId) {
                            // Found Plan, if versions are not equal ==> dirty
                            if (p1.version !== p2.version) {
                                dirty = true;
                            }
                            break;
                        }
                    }
                }
            }
            if (newValue.plans.length > 0) $scope.isValid = true;
            $scope.isDirty = dirty;
        }, true);

        function init() {
            svcScreenModel.updateTab('Plans');

            //find locked plan versions
            $q(function (resolve) {
                var promises = [];
                angular.forEach(definedPlans, function (plan) {
                    promises.push($q(function (resolve, reject) {
                        PlanVersion.query({orgId: $stateParams.orgId, planId: plan.id}, function (planVersions) {
                            var lockedVersions = [];
                            for (var j = 0; j < planVersions.length; j++) {
                                var planVersion = planVersions[j];
                                if (planVersion.status === 'Locked') {
                                    lockedVersions.push(planVersion.version);
                                }
                            }
                            // if we found locked plan versions then add them
                            if (lockedVersions.length > 0) {
                                plan.lockedVersions = lockedVersions;
                                lockedPlans.push(plan);
                            }
                            resolve(planVersions);
                        }, reject);
                    }));
                });
                $q.all(promises).then(function () {
                    lockedPlans.sort(function (a, b) {
                        if (a.id.toLowerCase() < b.id.toLowerCase()) {
                            return -1;
                        } else if (b.id < a.id) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    resolve(lockedPlans);
                    $scope.plans = lockedPlans;
                    $scope.reset();
                });
            });
            $scope.updatedService.autoAcceptContracts = $scope.version.autoAcceptContracts;
            $scope.updatedService.termsAgreementRequired = $scope.version.termsAgreementRequired;
        }

        var getSelectedPlans = function () {
            var selectedPlans = [];
            for (var i = 0; i < lockedPlans.length; i++) {
                var plan = lockedPlans[i];
                if (plan.checked) {
                    var selectedPlan = {};
                    selectedPlan.planId = plan.id;
                    selectedPlan.version = plan.selectedVersion;
                    selectedPlans.push(selectedPlan);
                }
            }
            return selectedPlans;
        };

        function reset() {
            for (var i = 0; i < lockedPlans.length; i++) {
                lockedPlans[i].selectedVersion = lockedPlans[i].lockedVersions[0];
                for (var j = 0; j < $scope.version.plans.length; j++) {
                    if (lockedPlans[i].id === $scope.version.plans[j].planId) {
                        lockedPlans[i].checked = true;
                        lockedPlans[i].selectedVersion = $scope.version.plans[j].version;
                        break;
                    }
                    lockedPlans[i].checked = false;
                }
            }
            $scope.updatedService.plans = getSelectedPlans();
            $scope.updatedService.autoAcceptContracts = $scope.version.autoAcceptContracts;
            $scope.isDirty = false;
        }



        function saveService() {
            service.updateServiceVersion($stateParams.orgId, $stateParams.svcId, $stateParams.versionId,
                $scope.updatedService).then(
                function (reply) {
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Settings for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                    if ($scope.tabStatus.hasPlan) {
                        $state.forceReload();
                    } else {
                        svcScreenModel.setHasPlan(true);
                        $state.go('^.scopes');
                    }
                },
                function (error) {
                    toastService.createErrorToast(error, 'Could not update the enabled plans.');
                });
        }

    }

    function serviceScopeCtrl($scope, $state, marketplaces, svcScreenModel, service,
                              toastService, _) {
        $scope.visibilities = [{ name: 'Show', val: true }, { name: 'Hide', val: false }];
        svcScreenModel.updateTab('Scopes');
        $scope.updatedService = {};
        $scope.changed = changed;

        var selectedMarketplaces = [];
        var origConfig = [];

        init();
        origConfig = angular.copy($scope.serviceVersion.visibility);

        /*set the current state of the service version*/
        function init(){

            $scope.mkts = [];
            angular.forEach(marketplaces.availableMarketplaces, function (mkt) {
                $scope.mkts.push(mkt);
            });

            if($scope.serviceVersion.visibility && $scope.serviceVersion.visibility.length > 0) {
                angular.forEach($scope.serviceVersion.visibility, function(svmkt){
                    angular.forEach($scope.mkts,function(mkt) {
                        if (mkt.code === svmkt.code) {
                            mkt.checked = true;
                            mkt.selectedVisibility = svmkt.show;
                        }
                    });
                });
            } else {
                angular.forEach($scope.mkts, function (market) {
                    // if no market has been selected for the service, enable the internal market by default
                    if ( market.code === 'int') {
                        market.checked = true;
                    }
                    // and set visibilities
                    market.selectedVisibility = true;
                })
            }
        }

        $scope.$watch('mkts', function (newValue) {
            selectedMarketplaces = [];
            angular.forEach(newValue,function(val){
                if(!val.hasOwnProperty('selectedVisibility')) val.selectedVisibility = true;
                if(val.checked) selectedMarketplaces.push(val);
            });
            setSelectedMarketplaces(selectedMarketplaces);
        }, true);

        function setSelectedMarketplaces(selectedMkts){
            if(selectedMkts){
                var mktVisibilities = [];
                angular.forEach(selectedMkts,function(sMkt){
                    var mktVisibility = {};
                    mktVisibility.code = sMkt.code;
                    mktVisibility.show = sMkt.selectedVisibility;
                    mktVisibilities.push(mktVisibility);
                });
                $scope.updatedService.visibility = mktVisibilities;
            } else $scope.updatedService.visibility = [];
        }

        $scope.reset = function () {
            init();
        };

        function changed() {
            if (!$scope.updatedService.visibility || $scope.updatedService.visibility.length === 0) {
                return false;
            }
            else if (origConfig.length === $scope.updatedService.visibility.length) {
                return _.differenceWith(origConfig, $scope.updatedService.visibility, function (a, b) {
                    return (a.code === b.code) && (a.show === b.show);
                }).length > 0;
            } else {
                return true;
            }
        }

        $scope.saveService = function () {
            if($scope.updatedService && changed()){
                service.updateServiceVersion($scope.serviceVersion.service.organization.id, $scope.serviceVersion.service.id, $scope.serviceVersion.version, $scope.updatedService).then(
                    function (reply) {
                        toastService.success('Availability for <b>' + $scope.serviceVersion.service.name + '</b> updated.');
                        if (origConfig.length > 0) {
                            $state.forceReload();
                        } else {
                            $state.go('^.policies').then(function () {
                                $state.forceReload();
                            });
                        }
                    },
                    function (error) {
                        toastService.createErrorToast(error, 'Could not update the store availability.');
                    });
            }
        };
    }

    function servicePoliciesCtrl($scope, $uibModal, policyData,
                                 svcScreenModel) {

        $scope.policies = policyData;
        svcScreenModel.updateTab('Policies');
        $scope.modalAddPolicy = modalAddPolicy;

        function modalAddPolicy() {
            $uibModal.open({
                templateUrl: '/views/modals/policyAdd.html',
                size: 'lg',
                controller: 'AddPolicyCtrl as ctrl',
                resolve: {
                    policyDefs: function (PolicyDefs) {
                        return PolicyDefs.query({}).$promise;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }
    }

    function serviceTermsCtrl($scope, $state, svcScreenModel, service, toastService, TOAST_TYPES) {

        svcScreenModel.updateTab('Terms');
        $scope.doSave = doSave;
        $scope.reset = reset;

        var orig = angular.copy($scope.serviceVersion.service.terms);

        function doSave() {
            var termsObject = {terms: $scope.serviceVersion.service.terms};
            service.updateTerms($scope.serviceVersion.service.organization.id, $scope.serviceVersion.service.id,
                termsObject).then(
                function (reply) {
                    $state.forceReload();
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Terms & conditions for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update the terms & conditions.');
                });
        }

        function reset() {
            $scope.serviceVersion.service.terms = orig;
        }

        $scope.$watch('serviceVersion.service.terms', function (terms) {
            $scope.changed = (terms !== orig);
            $scope.invalid = (terms === orig);
        }, true);

    }

    function serviceReadmeCtrl($scope, $state, svcScreenModel, service, toastService, TOAST_TYPES) {

        svcScreenModel.updateTab('Readme');
        $scope.doSave = doSave;
        $scope.reset = reset;

        var orig = angular.copy($scope.serviceVersion.readme);

        function doSave() {
            var updateObject = {
                readme: $scope.serviceVersion.readme
            };
            service.updateServiceVersion($scope.serviceVersion.service.organization.id,
                $scope.serviceVersion.service.id, $scope.serviceVersion.version, updateObject).then(
                function (reply) {
                    $state.forceReload();
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Readme for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update the Readme.');
                });
        }

        function reset() {
            $scope.serviceVersion.readme = orig;
        }

        $scope.$watch('serviceVersion.readme', function (terms) {
            $scope.changed = (terms !== orig);
            $scope.invalid = (terms === orig);
        }, true);

    }

    function serviceAnnouncementsCtrl($scope, $uibModal, svcScreenModel, announcements) {

        svcScreenModel.updateTab('Announcements');
        $scope.modalNewAnnouncement = modalNewAnnouncement;
        $scope.modalViewAnnouncement = modalViewAnnouncement;
        $scope.announcements = announcements;

        function modalNewAnnouncement() {
            $uibModal.open({
                templateUrl: 'views/modals/announcementCreate.html',
                size: 'lg',
                controller: 'NewAnnouncementCtrl as ctrl',
                resolve: {
                    svcVersion: function () {
                        return $scope.serviceVersion;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        function modalViewAnnouncement(announcement) {
            $uibModal.open({
                templateUrl: 'views/modals/announcementView.html',
                size: 'lg',
                controller: 'ViewAnnouncementCtrl as ctrl',
                resolve: {
                    announcement: function () {
                        return announcement;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

    }

    function serviceSupportCtrl($scope, $uibModal, svcScreenModel) {

        svcScreenModel.updateTab('Support');
        $scope.modalNewAnnouncement = modalNewAnnouncement;
        $scope.modalViewAnnouncement = modalViewAnnouncement;

        function modalNewAnnouncement() {
            $uibModal.open({
                templateUrl: 'views/modals/announcementCreate.html',
                size: 'lg',
                controller: 'NewAnnouncementCtrl as ctrl',
                resolve: {
                    svcVersion: function () {
                        return $scope.serviceVersion;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        function modalViewAnnouncement(announcement) {
            $uibModal.open({
                templateUrl: 'views/modals/announcementView.html',
                size: 'lg',
                controller: 'ViewAnnouncementCtrl as ctrl',
                resolve: {
                    announcement: function () {
                        return announcement;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

    }

    function serviceOverviewCtrl($scope, svcContracts, svcScreenModel, toastService) {

        svcScreenModel.updateTab('Overview');
        $scope.contractCount = svcContracts.length;
        classifyContracts(svcContracts);
        $scope.copy = copy;

        function copy() {
            toastService.info('<b>Copied to clipboard!</b>');
        }

        function classifyContracts(contracts) {
            $scope.contractOrgIds = [];
            $scope.contractOrgs = [];
            angular.forEach(contracts, function (contract) {
                if (!$scope.contractOrgs[contract.appOrganizationId]) {
                    $scope.contractOrgs[contract.appOrganizationId] = {
                        name: contract.appOrganizationName,
                        contracts: []
                    };
                }
                if ($scope.contractOrgIds.indexOf(contract.appOrganizationId) === -1) {
                    $scope.contractOrgIds.push(contract.appOrganizationId);
                }
                $scope.contractOrgs[contract.appOrganizationId].contracts.push(contract);
            });
        }

    }

    function serviceMetricsCtrl($scope, $stateParams, svcScreenModel,
                                ServiceMetricsResponse, ServiceMetricsResponseSummary, ServiceMarketInfo) {

        init();
        function init() {
            svcScreenModel.updateTab('Metrics');
            $scope.responseHistogramData = [];
            $scope.summary = {};
            $scope.marketInfo = {};
            $scope.uptime = [];

            $scope.fromDt = new Date();
            $scope.fromDt.setDate($scope.fromDt.getDate() - 7); //Start with a one week period
            $scope.toDt = new Date();
            $scope.interval = 'day';
            $scope.isIntervalMinute = false;
            updateMetrics();
        }

        $scope.open = function ($event, to) {
            $event.preventDefault();
            $event.stopPropagation();

            if (to) {
                $scope.toOpened = true;
            } else {
                $scope.fromOpened = true;
            }
        };

        ServiceMarketInfo.get(
            {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
            function (reply) {
                $scope.marketInfo = reply;
                $scope.uptime.push(reply);
            });

        function updateMetrics() {
            ServiceMetricsResponse.get(
                {
                    orgId: $stateParams.orgId,
                    svcId: $stateParams.svcId,
                    versionId: $stateParams.versionId,
                    from: $scope.fromDt,
                    to: $scope.toDt,
                    interval: $scope.interval
                },
                function (response) {
                    $scope.metricsError = false;
                    createResponseHistogram(response.data);
                }, function () {
                    $scope.metricsError = true;
                });
            ServiceMetricsResponseSummary.get(
                {
                    orgId: $stateParams.orgId,
                    svcId: $stateParams.svcId,
                    versionId: $stateParams.versionId,
                    from: $scope.fromDt,
                    to: $scope.toDt
                },
                function (metrics) {
                    $scope.responseMetricsError = false;
                    $scope.summary = metrics.data[0];
                }, function () {
                    $scope.responseMetricsError = true;
                });
        }

        function getMinuteMetrics() {
            $scope.fromDt = new Date();
            $scope.fromDt.setDate($scope.fromDt.getDate() - 1); // Only get minute statistics for the last day.
            $scope.toDt = new Date();
            updateMetrics();
        }

        $scope.$watch('fromDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (!$scope.isIntervalMinute) {
                    updateMetrics();
                }
            }
        });

        $scope.$watch('toDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (!$scope.isIntervalMinute) {
                    updateMetrics();
                }
            }
        });

        $scope.$watch('interval', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if ($scope.interval === 'minute') {
                    $scope.isIntervalMinute = true;
                    getMinuteMetrics();
                } else {
                    $scope.isIntervalMinute = false;
                }
                updateMetrics();
            }
        });

        $scope.formatFunction = function (x) {
            return x.getDay();
        };

        function setBlanksToZero(property) {
            return angular.isDefined(property) ? property : 0;
        }

        function createResponseHistogram(dataArray) {
            $scope.responseHistogramData = [];

            angular.forEach(dataArray, function (data) {
                var date = new Date(data.dateInterval);
                var display = '';

                switch ($scope.interval) {
                    case 'month':
                        display = date.getMonth();
                        break;
                    case 'week':
                        display = date.getDate() + '/' + (date.getMonth() + 1);
                        break;
                    case 'day':
                        display = date.getDate() + '/' + (date.getMonth() + 1);
                        break;
                    case 'hour':
                        display = date.getDate() + '/' + (date.getMonth() + 1) + ' ';
                        if (date.getHours < 10) {
                            display += '0';
                        }
                        display += date.getHours() + ':00';
                        break;
                    case 'minute':
                        display = date.getDate() + '/' + (date.getMonth() + 1) + ' ';
                        if (date.getHours() < 10) {
                            display += '0';
                        }
                        display += date.getHours() + ':';
                        if (date.getMinutes() < 10) {
                            display += '0';
                        }
                        display += date.getMinutes();
                        break;
                }

                var graphObject = {
                    'x': date,
                    'displayDate': display,
                    'latency_kong': setBlanksToZero(data.latencyKong),
                    'latency_proxy': setBlanksToZero(data.latencyProxy),
                    'latency_request': setBlanksToZero(data.latencyRequest),
                    'requests_count': setBlanksToZero(data.requestsCount),
                    'requests_wrong': setBlanksToZero(data.requestsWrong),
                    'response_wrong': setBlanksToZero(data.responseWrong)
                };
                $scope.responseHistogramData.push(graphObject);
            });

            $scope.responseHistogramData.sort(function (a, b) {
                return a.x - b.x;
            });
        }

        $scope.responseHistogramColumns = [
            {'id': 'latency_request', 'name': 'Request latency', 'type': 'line', 'color': 'blue'},
            {'id': 'latency_kong', 'name': 'Kong latency', 'type': 'line', 'color': '#071F82'},
            {'id': 'latency_proxy', 'name': 'Proxy latency', 'type': 'line', 'color': '#4F6378'},
            {'id': 'requests_count', 'name': 'Requests', 'type': 'line', 'color': '#25A26A'},
            {'id': 'requests_wrong', 'name': 'Malformed requests', 'type': 'line', 'color': '#FDBE28'},
            {'id': 'response_wrong', 'name': 'Service errors', 'type': 'line', 'color': '#D80303'}
        ];
        $scope.responseHistogramX = {'id': 'displayDate'};

        $scope.gaugeColumns = [{'id': 'uptime', 'name': 'Uptime %', 'type': 'gauge', 'color': 'green'}];

    }

})();
