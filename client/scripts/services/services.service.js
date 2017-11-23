(function () {
    'use strict';

    angular.module('app.service')
        .service('service', service)
        .service('svcScreenModel', svcScreenModel)
        .service('svcTab', svcTab);

    function service($q, $uibModal, Service, ServiceEndpoint, ServiceTerms, ServiceVersion, ServiceVersionDefinition,
                     ServiceVersionUpstream, ServiceVersionUpstreamAdd, ServiceVersionUpstreamRemove,
                     Categories, DefaultTerms, BrandingService, _) {
        this.deleteService = deleteService;
        this.deleteServiceVersion = deleteServiceVersion;
        this.deprecateServiceVersion = deprecateServiceVersion;
        this.editDetails = editDetails;
        this.getServicesForOrg = getServicesForOrg;
        this.getServiceVersions = getServiceVersions;
        this.getDefinition = getDefinition;
        this.getEndpoint = getEndpoint;
        this.getVersion = getVersion;
        this.addVersionUpstream = addVersionUpstream;
        this.getVersionUpstream = getVersionUpstream;
        this.removeVersionUpstream = removeVersionUpstream;
        this.publishServiceVersion = publishServiceVersion;
        this.retireServiceVersion = retireServiceVersion;
        this.updateDefinition = updateDefinition;
        this.updateDescription = updateDescription;
        this.updateServiceVersion = updateServiceVersion;
        this.updateTerms = updateTerms;
        this.getDefaultTerms = getDefaultTerms;
        this.getAllCategories = getAllCategories;


        function deleteService(orgId, svcId, svcName) {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/serviceDelete.html',
                size: 'lg',
                controller: 'DeleteServiceCtrl as ctrl',
                resolve: {
                    organizationId: function () {
                        return orgId;
                    },
                    serviceId: function () {
                        return svcId;
                    },
                    serviceName: function () {
                        return svcName;
                    }
                },
                backdrop : 'static'
            });

            return modalInstance.result;
        }
        
        function deleteServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId}).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/serviceVersionDelete.html',
                    size: 'lg',
                    controller: 'DeleteServiceVersionCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        },
                        lastVersion: function () {
                            return ServiceVersion.query({ orgId: orgId, svcId: svcId}).$promise.then(function (reply) {
                                return reply.length === 1;
                            })
                        }
                    },
                    backdrop : 'static'
                });

                return modalInstance.result;
            });
        }
        
        function deprecateServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/serviceDeprecate.html',
                    size: 'lg',
                    controller: 'DeprecateServiceCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        }
                    },
                    backdrop : 'static'
                });

                return modalInstance.result;
            });
        }

        function editDetails(orgId, svcId) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/serviceEdit.html',
                size: 'lg',
                controller: 'ServiceEditCtrl as ctrl',
                resolve: {
                    svc: function () {
                        return Service.get({ orgId: orgId, svcId: svcId }).$promise;
                    },
                    branding: function () {
                        return BrandingService.getBrandings();
                    }
                },
                backdrop : 'static'
            });
            modalInstance.result.then(function(updatedSvc) {
                var updateObj = {
                    name: updatedSvc.name,
                    description: updatedSvc.description,
                    categories: _.map(updatedSvc.categories, 'text')
                };

                if (_.has(updatedSvc, 'selectedBranding')) {
                    // the selected branding was changed

                    if (_.has(updatedSvc.selectedBranding, 'id')) {
                        // a new branding was selected, remove old one and apply new one
                        // check for existing branding
                        if (_.isEmpty(updatedSvc.brandings)) {
                            // no existing branding, add new one
                            BrandingService.addBrandingToService(orgId, svcId, updatedSvc.selectedBranding).then(function () {
                                deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                            })
                        } else {
                            // already has branding, remove it first
                            BrandingService.removeBrandingFromService(orgId, svcId, updatedSvc.brandings[0].id).then(function () {
                                BrandingService.addBrandingToService(orgId, svcId, updatedSvc.selectedBranding).then(function () {
                                    deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                                });
                            })
                        }

                    } else {
                        // user has opted to apply no branding, remove existing
                        if (!_.isEmpty(updatedSvc.brandings)) {
                            BrandingService.removeBrandingFromService(orgId, svcId, updatedSvc.brandings[0].id).then(function () {
                                deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                            })
                        }
                    }


                } else {
                    deferred.resolve(Service.update({ orgId: orgId, svcId: svcId }, updateObj).$promise);
                }
            }, function () {
                deferred.resolve('canceled');
            });
            return deferred.promise;
        }
        
        function getDefaultTerms() {
            return DefaultTerms.get().$promise;
        }

        function getAllCategories() {
            return Categories.query().$promise;
        }
        
        function getServicesForOrg(orgId) {
            return Service.query({ orgId: orgId }).$promise;
        }
        
        function getServiceVersions(orgId, svcId) {
            return ServiceVersion.query({ orgId: orgId, svcId: svcId }).$promise;
        }
        
        function getDefinition(orgId, svcId, versionId) {
            return ServiceVersionDefinition.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }
        
        function getEndpoint(orgId, svcId, versionId) {
            return ServiceEndpoint.get({orgId: orgId, svcId: svcId, versionId: versionId}).$promise;
        }

        function getVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise;
        }

        function addVersionUpstream(orgId, svcId, versionId, target) {
            return ServiceVersionUpstreamAdd.save({ orgId, svcId, versionId }, target).$promise
        }

        function getVersionUpstream(orgId, svcId, versionId) {
            return ServiceVersionUpstream.get({ orgId, svcId, versionId }).$promise;
        }

        function removeVersionUpstream(orgId, svcId, versionId, target) {
            return ServiceVersionUpstreamRemove.save({ orgId, svcId, versionId }, target).$promise;
        }

        function publishServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/servicePublish.html',
                    size: 'lg',
                    controller: 'PublishServiceCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        }
                    },
                    backdrop: 'static'
                });

                return modalInstance.result;
            });
        }

        function retireServiceVersion(orgId, svcId, versionId) {
            return ServiceVersion.get({ orgId: orgId, svcId: svcId, versionId: versionId }).$promise.then(function (reply) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/modals/serviceRetire.html',
                    size: 'lg',
                    controller: 'RetireServiceCtrl as ctrl',
                    resolve: {
                        svcVersion: function () {
                            return reply;
                        }
                    },
                    backdrop : 'static'
                });

                return modalInstance.result;
            });
        }

        function updateDefinition(orgId, svcId, versionId, updatedDefininitionObject) {
            return ServiceVersionDefinition.update({ orgId: orgId, svcId: svcId, versionId: versionId},
                updatedDefininitionObject).$promise;
        }
        
        function updateDescription(orgId, svcId, newDescription) {
            return Service.update({ orgId: orgId, svcId: svcId }, { description: newDescription }).$promise;
        }
        
        function updateServiceVersion(orgId, svcId, versionId, updateObject) {
            return ServiceVersion.update({ orgId: orgId, svcId: svcId, versionId: versionId }, updateObject).$promise
        }

        function updateTerms(orgId, svcId, termsObject) {
            return ServiceTerms.update({ orgId: orgId, svcId: svcId }, termsObject).$promise;
        }
    }
    
    function svcTab() {

        this.selectedTab = 'Documentation';

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

    }

    function svcScreenModel() {
        this.selectedTab = 'Overview';
        this.service = {};
        this.tabStatus = {
            hasImplementation: false,
            hasDefinition: false,
            hasPlan: false
        };

        this.updateTab = function (newTab) {
            this.selectedTab = newTab;
        };

        this.updateService = function (newSvc) {
            this.service = newSvc;
            this.tabStatus.hasImplementation = newSvc.endpoint !== null;
        };

        this.setHasImplementation = function (bool) {
            this.tabStatus.hasImplementation = bool;
        };

        this.setHasDefinition = function (bool) {
            this.tabStatus.hasDefinition = bool;
        };
        
        this.setHasPlan = function (bool) {
            this.tabStatus.hasPlan = bool;
        }
    }

})();
