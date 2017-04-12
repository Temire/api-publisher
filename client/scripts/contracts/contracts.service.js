(function () {
    'use strict';

    angular.module('app.contracts')
        .service('contractService', contractService);


    function contractService($q, $rootScope, AcceptContract, CancelContractRequest, ContractRequests, OrgIncomingPendingContracts,
                             OrgOutgoingPendingContracts, RejectContract, RequestContract, EVENTS) {
        this.accept = accept;
        this.break = breakContract;
        this.incomingPendingForOrg = incomingPendingForOrg;
        this.outgoingPendingForOrg = outgoingPendingForOrg;
        this.getPendingForSvc = getPendingForSvc;
        this.reject = reject;
        this.request = requestContract;
        this.cancelRequest = cancelRequest;
        
        function accept(contract) {
            console.log("Accept Contract:"+JSON.stringify(contract));
            var acceptObj = {
                serviceOrgId: contract.serviceOrg,
                serviceId: contract.serviceId,
                serviceVersion: contract.serviceVersion,
                planId: contract.planDetails.id
            };
            return AcceptContract.save({ orgId: contract.appOrg, appId: contract.appId, versionId: contract.appVersion },
                acceptObj, function () {
                    $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
                }).$promise;
        }

        function breakContract(orgId, appId, versionId, contractId) {
            return ApplicationContract
                .delete({orgId: orgId, appId: appId, versionId: versionId, contractId: contractId}).$promise;
        }


        function incomingPendingForOrg(orgId) {
            return OrgIncomingPendingContracts.query({ orgId: orgId }).$promise;
        }


        function outgoingPendingForOrg(orgId) {
            return OrgOutgoingPendingContracts.query({ orgId: orgId}).$promise;
        }
        
        function getPendingForSvc(orgId, svcId, versionId) {
            var deferred = $q.defer();
            ContractRequests.query({ orgId: orgId }, function (requests) {
                var contracts = [];
                var applicationDetPromises = [];

                requests.forEach(function (req) {
                    if (req.serviceId === svcId && req.serviceVersion === versionId) {
                        ;
                        applicationDetPromises.push(ApplicationVersion.get({ orgId: req.appOrg, appId: req.appId, versionId: req.appVersion }).$promise
                            .then(function (appVersion) {
                                req.appDetails = appVersion;
                                contracts.push(req);
                            }));
                    }
                });

                $q.all(applicationDetPromises).then(function() {
                    deferred.resolve(contracts);
                })
            });
            return deferred.promise;
        }

        function reject(contract) {
            var rejectObj = {
                serviceOrgId: contract.serviceOrg,
                serviceId: contract.serviceId,
                serviceVersion: contract.serviceVersion,
                planId: contract.planDetails.id
            };
            return RejectContract.save({ orgId: contract.appOrg, appId: contract.appId, versionId: contract.appVersion },
                rejectObj, function () {
                    $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
                }).$promise;
        }

        function requestContract(svcOrgId, svcId, svcVersion, planId, appOrgId, appId, appVersion, termsAgreed) {
            var requestObj = {
                applicationOrg: appOrgId,
                applicationId: appId,
                applicationVersion: appVersion,
                planId: planId,
                termsAgreed: termsAgreed
            };
            return RequestContract.save({ orgId: svcOrgId, svcId: svcId, versionId: svcVersion}, requestObj, function () {
                $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
            }).$promise;
        }
        
        function cancelRequest(svcOrgId, svcId, svcVersion, appOrgId, appId, appVersion) {
            var cancelObj = {
                organizationId: appOrgId,
                applicationId: appId,
                version: appVersion
            };
            return CancelContractRequest.save({ orgId: svcOrgId, svcId: svcId, versionId: svcVersion }, cancelObj, function () {
                $rootScope.$broadcast(EVENTS.NOTIFICATIONS_UPDATED);
            }).$promise;
        }

    }

})();
