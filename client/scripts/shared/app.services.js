;(function(angular) {
    'use strict';

    angular.module('app.services', [])

        // ACTION SERVICE
        .service('actionService',
            function ($state, toastService, TOAST_TYPES, Action, ACTIONS, Application, Service) {

                this.createAction = function (entityVersion, type) {
                    var action = {};
                    switch (type) {
                        case ACTIONS.DEPRECATE:
                            action = {
                                type: ACTIONS.DEPRECATE,
                                organizationId: entityVersion.service.organization.id,
                                entityId: entityVersion.service.id,
                                entityVersion: entityVersion.version
                            };
                            return action;
                        case ACTIONS.LOCK:
                            action = {
                                type: ACTIONS.LOCK,
                                organizationId: entityVersion.plan.organization.id,
                                entityId: entityVersion.plan.id,
                                entityVersion: entityVersion.version
                            };
                            return action;
                        case ACTIONS.REGISTER:
                            action = {
                                type: ACTIONS.REGISTER,
                                entityVersion: entityVersion.version
                            };
                            if (angular.isDefined(entityVersion.organizationId)) {
                                action.organizationId = entityVersion.organizationId;
                                action.entityId = entityVersion.id;
                            } else {
                                action.organizationId = entityVersion.application.organization.id;
                                action.entityId = entityVersion.application.id;
                            }
                            return action;
                        case ACTIONS.UNREGISTER:
                            action = {
                                type: ACTIONS.UNREGISTER,
                                entityVersion: entityVersion.version
                            };
                            if (angular.isDefined(entityVersion.organizationId)) {
                                action.organizationId = entityVersion.organizationId;
                                action.entityId = entityVersion.id;
                            } else {
                                action.organizationId = entityVersion.application.organization.id;
                                action.entityId = entityVersion.application.id;
                            }
                            return action;
                        case ACTIONS.PUBLISH:
                            action = {
                                type: ACTIONS.PUBLISH,
                                organizationId: entityVersion.service.organization.id,
                                entityId: entityVersion.service.id,
                                entityVersion: entityVersion.version
                            };
                            return action;
                        case ACTIONS.RETIRE:
                            action = {
                                type: ACTIONS.RETIRE,
                                organizationId: entityVersion.service.organization.id,
                                entityId: entityVersion.service.id,
                                entityVersion: entityVersion.version
                            };
                            return action;
                    }
                };

                var doAction = function (action, shouldReload, type, msg) {
                    return Action.save(action, function () {
                        if (shouldReload) {
                            $state.forceReload();
                        }
                        if (type && msg) {
                            toastService.createToast(type, msg, true);
                        }
                    }, function (error) {
                        if (!(error.status === 409)) toastService.createToast(TOAST_TYPES.DANGER, 'Oops! An error has occurred :(', true);
                    }).$promise;
                };

                this.publishService = function (serviceVersion, shouldReload) {
                    var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version +
                        '</b> was successfully published!';
                    return doAction(this.createAction(serviceVersion, ACTIONS.PUBLISH),
                        shouldReload, TOAST_TYPES.SUCCESS, msg);
                };

                this.retireService = function (serviceVersion, shouldReload) {
                    var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version + '</b> was retired.';
                    return doAction(this.createAction(serviceVersion, ACTIONS.RETIRE),
                        shouldReload, TOAST_TYPES.WARNING, msg);
                };

                this.deprecateService = function (serviceVersion, shouldReload) {
                    var msg = '<b>' + serviceVersion.service.name + ' ' + serviceVersion.version + '</b> was deprecated.';
                    return doAction(this.createAction(serviceVersion, ACTIONS.DEPRECATE),
                        shouldReload, TOAST_TYPES.INFO, msg);
                };

                this.lockPlan = function (planVersion, shouldReload) {
                    var msg = '<b>' + planVersion.plan.name + ' ' + planVersion.version +
                        '</b> was successfully locked!';
                    return doAction(this.createAction(planVersion, ACTIONS.LOCK),
                        shouldReload, TOAST_TYPES.SUCCESS, msg);
                };

                this.publishApp = function (applicationVersion, shouldReload) {
                    var msg = '<b>' + applicationVersion.application.name + ' ' + applicationVersion.version +
                        '</b> was successfully published!';
                    return doAction(this.createAction(
                        applicationVersion, ACTIONS.REGISTER),
                        shouldReload, TOAST_TYPES.SUCCESS,
                        msg);
                };

                this.retireApp = function (applicationVersion, shouldReload) {
                    var msg = '<b>' + applicationVersion.application.name + ' ' + applicationVersion.version +
                        '</b> was retired.';
                    return doAction(this.createAction(
                        applicationVersion, ACTIONS.UNREGISTER),
                        shouldReload,
                        TOAST_TYPES.WARNING, msg);
                };

                // DELETE METHODS == USE WITH CAUTION!

                this.deleteApp = function (organizationId, applicationId, applicationName) {
                    return Application.remove({orgId: organizationId, appId: applicationId}, function (success) {
                        toastService.createToast(TOAST_TYPES.INFO, 'Application <b>' + applicationName + '</b> deleted.', true);
                    }, function (fail) {
                        toastService.createErrorToast(fail, 'Could not delete application');
                    }).$promise;
                };

                this.deleteSvc = function (organizationId, serviceId, serviceName) {
                    return Service.remove({orgId: organizationId, svcId: serviceId}, function (success) {
                        toastService.createToast(TOAST_TYPES.INFO, 'Service <b>' + serviceName + '</b> deleted.', true);
                    }, function (fail) {
                        toastService.createErrorToast(fail, 'Could not delete service');
                    }).$promise;
                };
            })

        // ALERT SERVICE
        .service('alertService', function () {

            var alerts = [];

            this.alerts = alerts;

            this.closeAlert = function (index) {
                closeAlert(index);
            };

            this.addAlert = function (type, msg) {
                var alert = {
                    type: type,
                    msg: msg
                };
                this.alerts.push(alert);
            };

            this.resetAllAlerts = function () {
                while (alerts.length > 0) {
                    closeAlert(0);
                }
            };

            var closeAlert = function (index) {
                alerts.splice(index, 1);
            };
        })

        // IMAGE SERVICE
        .service('imageService', function (alertService, ALERT_TYPES) {

            var image = {
                isValid: true,
                fileData: null
            };

            this.image = image;

            this.checkFileType = function ($file) {
                alertService.resetAllAlerts();
                var allowedExtensions = ['jpg', 'jpeg', 'gif', 'png'];
                var fileExt = $file.getExtension();
                if (allowedExtensions.indexOf(fileExt) === -1) {
                    alertService.addAlert(ALERT_TYPES.DANGER,
                        '<b>Unsupported file type</b><br>Only JPG, GIF and PNG types are supported.');
                    return false;
                } else {
                    return true;
                }
            };

            this.readFile = function ($file) {
                if ($file.size > 100000) {
                    image.isValid = false;
                    alertService.addAlert(ALERT_TYPES.DANGER,
                        '<b>Maximum filesize exceeded!</b><br>Only filesizes of maximum 100KB are accepted.');
                } else {
                    image.isValid = true;
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        setImageData(event.target.result.substr(event.target.result.indexOf('base64') + 7));
                    };
                    reader.readAsDataURL($file.file);
                }
            };

            this.clear = function () {
                image.fileData = null;
                image.isValid = true;
            };

            var setImageData = function (data) {
                image.fileData = data;
            };

        })

        // TOAST SERVICE
        .service('toastService', function ($timeout, TOAST_TYPES) {
            var toasts = [];
            this.toasts = toasts;
            
            this.info = info;
            this.success = success;
            this.warning = warning;
            
            function info(msg) {
                createToast(TOAST_TYPES.INFO, msg, true);
            }
            
            function success(msg) {
                createToast(TOAST_TYPES.SUCCESS, msg, true);
            }
            
            function warning(msg) {
                createToast(TOAST_TYPES.WARNING, msg, true);
            }

            var closeToastAtIndex = function (index) {
                toasts.splice(index, 1);
            };

            this.closeToast = function(index) {
                closeToastAtIndex(index);
            };

            this.createToast = function(type, msg, autoclose) {
                var toast = {
                    type: type,
                    msg: msg
                };
                this.toasts.push(toast);

                if (autoclose) {
                    timedClose();
                }
            };

            this.success = function (msg) {
                this.createToast(TOAST_TYPES.SUCCESS, msg, true);
            };

            this.info = function (msg) {
                this.createToast(TOAST_TYPES.INFO, msg, true);
            };

            this.warning = function (msg) {
                this.createToast(TOAST_TYPES.WARNING, msg, true);
            };

            this.error = function (msg) {
                this.createToast(TOAST_TYPES.DANGER, msg, true);
            };

            this.createErrorToast = function(error, heading) {
                var toastType = TOAST_TYPES.DANGER;
                var errorMsg = '<b>' + heading + '</b><br>' + error.data.message;

                switch (error.status) {
                    case 404:
                        toastType = TOAST_TYPES.WARNING;
                        break;
                    case 409: //CONFLICT
                        toastType = TOAST_TYPES.WARNING;
                        break;
                    default:
                        break;
                }
                this.createToast(toastType, errorMsg, true);
            };

            var timedClose = function () {
                $timeout(function() {
                    closeToastAtIndex(0);
                }, 5000);
            };
        })

        // HEADER MODEL
        .service('headerModel', function ($rootScope) {
            this.showExplore = false;
            this.showDash = false;
            this.showSearch = false;

            this.setIsButtonVisible = function (explore, dash, search) {
                this.showExplore = explore;
                this.showDash = dash;
                this.showSearch = search;
                $rootScope.$broadcast('buttonToggle', 'toggled!');
            };
        })

        // ORGANIZATION SCREEN MODEL
        .service('orgScreenModel', function (Organization) {

            this.selectedTab = 'Plans';
            this.organization = undefined;

            this.updateTab = function (newTab) {
                this.selectedTab = newTab;
            };

            this.updateOrganization = function (org) {
                this.organization = org;
            };

            this.getOrgDataForId = function (orgScreenModel, id) {
                Organization.get({id: id}, function (reply) {
                    orgScreenModel.updateOrganization(reply);
                });
            };
        })

        // RESOURCE UTILITY SERVICE
        .service('resourceUtil', function () {
            this.cleanResponse = cleanResponse;

            // This function will remove the $promise and $resolved properties from a resource promise,
            // leaving us with a clean Javascript Object
            function cleanResponse(resolvedPromise) {
                return angular.fromJson(angular.toJson(resolvedPromise));
            }
        })

        // DASHBOARD SELECTED APP HELPER
        .service('selectedApp', function () {
            this.appVersion = null;

            this.updateApplication = function (newApp) {
                this.appVersion = newApp;
            };

            this.reset = function () {
                this.appVersion = undefined;
            };
        })

        // APPLICATION SCREEN MODEL
        .service('appScreenModel', function () {
            this.selectedTab = 'Overview';
            this.application = {};

            this.updateTab = function (newTab) {
                this.selectedTab = newTab;
            };

            this.updateApplication = function (newApp) {
                this.application = newApp;
            };
        })



        // SERVICE DOC MODEL
        .service('svcModel', function () {

            var service = null;

            this.setService = function (serv) {
                service = serv;
            };

            this.getService = function () {
                return service;
            };

        })

        // DOCUMENTATION TESTING HELPER
        .service('docTester', function () {
            this.preferredContract = undefined;

            this.setPreferredContract = function (contract) {
                this.preferredContract = contract;
            };

            this.reset = function () {
                this.preferredContract = undefined;
            };
        })

        // POLICY CONFIG DETAILS
        .service('policyConfig', function () {
            this.createConfigObject = function (policyDetails) {
                var configObjects = [];
                angular.forEach(angular.fromJson(policyDetails.configuration), function (value, key) {
                    var configObject = {
                        key: key,
                        value: value
                    };
                    configObjects.push(configObject);
                });
                return configObjects;
            };
        })

        // FOLLOWER SERVICE
        .service('followerService',
            function ($state, currentUserModel, toastService, loginHelper,
                      ServiceFollowerAdd, ServiceFollowerRemove) {
                this.addFollower = addFollower;
                this.removeFollower = removeFollower;

                function addFollower(svcVersion) {
                    if (loginHelper.checkLoggedIn()) {
                        ServiceFollowerAdd.save({orgId: svcVersion.service.organization.id,
                                svcId: svcVersion.service.id,
                                userId: currentUserModel.currentUser.username},
                            {},
                            function () {
                                $state.forceReload();
                                toastService.success('You are now following <b>' + svcVersion.service.name + '</b>.');
                            }, function (error) {
                                toastService.createErrorToast(error, 'Could not follow this service');
                            });
                    } else {
                        toastService.warning('<b>Please log in to follow this service!</b>');
                    }
                }

                function removeFollower(svcVersion) {
                    if (loginHelper.checkLoggedIn()) {
                        ServiceFollowerRemove.save({orgId: svcVersion.service.organization.id,
                                svcId: svcVersion.service.id,
                                userId: currentUserModel.currentUser.username},
                            {},
                            function () {
                                $state.forceReload();
                                toastService.warning('You are no longer following <b>' + svcVersion.service.name + '</b>.');
                            }, function (error) {
                                toastService.createErrorToast(error, 'Could not unfollow this service');
                            });
                    } else {
                        toastService.warning('<b>Please log in to unfollow this service!</b>');
                    }
                }
            })

        // OAUTH SERVICE
        .service('oAuthService',
            function ($http, $q, ApplicationOAuth, ApplicationContract,
                      OAuthConsumer, ServiceVersionPolicy) {

                this.grant = grant;
                this.getAppOAuthInfo = getAppOAuthInfo;
                this.createOAuthConsumer = createOAuthConsumer;
                this.needsCallback = needsCallback;

                function getAppOAuthInfo(clientId, orgId, svcId, versionId) {
                    return ApplicationOAuth.get({clientId: clientId,
                        orgId: orgId,
                        svcId: svcId,
                        versionId: versionId
                    }).$promise;
                }

                function createOAuthConsumer(clientId, clientSecret, userName) {
                    var consumer = {
                        appOAuthId: clientId,
                        appOAuthSecret: clientSecret,
                        uniqueUserName: userName
                    };
                    return OAuthConsumer.create(consumer, function (reply) {
                    }).$promise;
                }

                function constructGrantObject(clientId, clientSecret, responseType, scopeString, provisionKey, userId) {
                    return {
                        client_id: clientId,
                        client_secret: clientSecret,
                        response_type: responseType,
                        scope: scopeString,
                        provision_key: provisionKey,
                        authenticated_userid: userId
                    };
                }

                function constructScopeString(scopesToGrant) {
                    var keysToConcat = [];
                    angular.forEach(scopesToGrant, function (scope) {
                        if (scope.checked) {
                            keysToConcat.push(scope.scope);
                        }
                    });
                    return keysToConcat.join(' ');
                }

                function grant(grantUrl, clientId, clientSecret, responseType, scopes, provisionKey, userId) {
                    var scopesToGrant = constructScopeString(scopes);
                    var grantObject = constructGrantObject(clientId,
                        clientSecret, responseType, scopesToGrant, provisionKey, userId);
                    return postFormEncoded(grantUrl, grantObject);
                }

                function needsCallback(appOrgId, appId, appVersion) {
                    // Disable callback url not being required for Client Credentials grant,
                    // Now compulsory for all types of OAuth

                    return ApplicationContract.query({
                        orgId: appOrgId,
                        appId: appId,
                        versionId: appVersion}).$promise
                        .then(function (contracts) {
                            var promises = [];

                            angular.forEach(contracts, function (contract) {
                                promises.push(ServiceVersionPolicy.query({orgId: contract.serviceOrganizationId,
                                    svcId: contract.serviceId,
                                    versionId: contract.serviceVersion}).$promise);
                            });
                            return $q.all(promises).then(function (result) {
                                var needsCallback = false;
                                for (var i = 0; i < result.length; i++) {
                                    for (var j = 0; j < result[i].length; j++) {
                                        if (result[i][j].policyDefinitionId === 'OAuth2') {
                                            needsCallback = true;
                                            break;
                                        }
                                    }
                                }
                                return needsCallback;
                            });

                            // Old method preserved here for revert purposes
                            // =============================================

                            // var promises = [];
                            // // var secondaryPromises = [];
                            //
                            // angular.forEach(contracts, function (contract) {
                            //     promises.push(ServiceVersionPolicy.query({orgId: contract.serviceOrganizationId,
                            //         svcId: contract.serviceId,
                            //         versionId: contract.serviceVersion}, function (policies) {
                            //         angular.forEach(policies, function (policy) {
                            //             if (policy.policyDefinitionId === 'OAuth2') {
                            //                 secondaryPromises.push(ServiceVersionPolicy.get(
                            //                     {orgId: contract.serviceOrganizationId,
                            //                         svcId: contract.serviceId,
                            //                         versionId: contract.serviceVersion,
                            //                         policyId: policy.id}).$promise);
                            //             }
                            //         })
                            //     }).$promise);
                            // });
                            // return $q.all(promises).then(function (result) {
                            //     return $q.all(secondaryPromises).then(function (policyList) {
                            //         var needsCallback = false;
                            //         for (var i = 0; i < policyList.length; i++) {
                            //             var policyConfiguration = angular.fromJson(policyList[i].configuration);
                            //             if (policyConfiguration.enable_implicit_grant ||
                            //                 policyConfiguration.enable_authorization_code) {
                            //                 needsCallback = true;
                            //                 break;
                            //             }
                            //         }
                            //         return needsCallback;
                            //     });
                            // });
                        });
                }

                function postFormEncoded(url, data) {
                    return $http({
                        method: 'POST',
                        url: url,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param(data)
                    });
                }
            })

        // DOC DOWNLOADER
        .service('docDownloader', function (toastService, MktServiceVersionDefinition, ServiceVersionDefinition, loginHelper, FileSaver, CONFIG) {

            this.fetch = fetch;
            this.fetchWithContract = fetchWithContract;
            this.fetchWithServiceVersion = fetchWithServiceVersion;

            function fetch(orgId, svcId, versionId) {
                var fileName = svcId + '-' + versionId + '-swagger.json';

                if (loginHelper.checkLoggedIn()) {
                    return ServiceVersionDefinition.get({ orgId: orgId, svcId: svcId, versionId: versionId },
                        function (definitionSpec) {
                            handleDefinitionDownload(definitionSpec, fileName);
                        });
                } else {
                    return MktServiceVersionDefinition.get({ orgId: orgId, svcId: svcId, versionId: versionId },
                        function (definitionSpec) {
                            handleDefinitionDownload(definitionSpec, fileName);
                        });
                }
            }

            function handleDefinitionDownload(spec, filename) {
                toastService.info('<b>Downloading...</b>');
                spec.host = CONFIG.KONG.HOST;
                var data = angular.toJson(spec, true);
                var file = new Blob([data], { type: 'text/json' });
                FileSaver.saveAs(file, filename);
            }

            function fetchWithContract(contract) {
                fetch(contract.serviceOrganizationId, contract.serviceId, contract.serviceVersion);
            }

            function fetchWithServiceVersion(svcVersion) {
                fetch(svcVersion.service.organization.id, svcVersion.service.id, svcVersion.version);
            }
        })

        // USER SCREEN MODEL
        .service('userScreenModel', function () {
            this.selectedTab = 'Profile';

            this.userInfo = {
                fullName: '',
                company: '',
                location: '',
                website: '',
                bio: ''
            };

            this.updateTab = function (newTab) {
                this.selectedTab = newTab;
            };
        });

})(window.angular);
