(function () {
    'use strict';

    angular.module('app.policies')
        .service('policyService', policyService);


    function policyService($q, $sce, MktServiceVersionPolicy, PlanVersionPolicy, ServiceVersionPolicy, PolicyDefs, CONFIG, POLICIES, _) {
        // this.getPlanPoliciesWithDetailsForMarket = getPlanPoliciesWithDetailsForMarket;
        this.getPlanPoliciesWithDetails = getPlanPoliciesWithDetails;
        this.getServicePoliciesWithDetailsForMarket = getServicePoliciesWithDetailsForMarket;
        this.getServicePoliciesWithDetails = getServicePoliciesWithDetails;
        this.getServicePolicyDetails = getServicePolicyDetails;
        this.getPolicyDefinition = getPolicyDefinition;
        this.deletePlanPolicy = deletePlanPolicy;
        this.deleteServicePolicy = deleteServicePolicy;
        this.updatePlanPolicy = updatePlanPolicy;
        this.updateServicePolicy = updateServicePolicy;


        function deletePlanPolicy(orgId, planId, versionId, policyId) {
            return PlanVersionPolicy.delete({
                orgId: orgId,
                planId: planId,
                versionId: versionId,
                policyId: policyId
            }).$promise;
        }

        function deleteServicePolicy(orgId, svcId, versionId, policyId) {
            return ServiceVersionPolicy.delete({
                orgId: orgId,
                svcId: svcId,
                versionId: versionId,
                policyId: policyId
            }).$promise;
        }

        function getPlanPolicyDetails(orgId, planId, versionId, policyId) {
            return PlanVersionPolicy.get({
                orgId: orgId,
                planId: planId,
                versionId: versionId,
                policyId: policyId
            }).$promise;
        }

        function getPlanPoliciesWithDetails(orgId, planId, versionId) {
            return PlanVersionPolicy.query({
                orgId: orgId,
                planId: planId,
                versionId: versionId
            }).$promise.then(function (policies) {
                var promises = [];
                _.forEach(policies, function (policy) {
                    promises.push(getPlanPolicyDetails(orgId, planId, versionId, policy.id).then(function (details) {
                        policy.details = details;
                        policy.configurable = isConfigurable(policy.policyDefinitionId);
                    }));
                });

                return $q.all(promises).then(function () {
                    return policies;
                });
            })
        }

        function getServicePoliciesWithDetailsForMarket(orgId, svcId, versionId) {
            return MktServiceVersionPolicy.query({
                orgId: orgId,
                svcId: svcId,
                versionId: versionId
            }).$promise.then(function (policies) {
                var promises = [];
                _.forEach(policies, function (policy) {
                    promises.push(getMktServicePolicyDetails(orgId, svcId, versionId, policy.id).then(function (details) {
                        policy.details = details;
                    }));
                });

                return $q.all(promises).then(function () {
                    return policies;
                });
            })
        }

        function getServicePoliciesWithDetails(orgId, svcId, versionId) {
            return ServiceVersionPolicy.query({
                orgId: orgId,
                svcId: svcId,
                versionId: versionId
            }).$promise.then(function (policies) {
                var promises = [];
                _.forEach(policies, function (policy) {
                    promises.push(getServicePolicyDetails(orgId, svcId, versionId, policy.id).then(function (details) {
                        policy.details = details;
                        policy.configurable = isConfigurable(policy.policyDefinitionId);
                    }));
                });

                return $q.all(promises).then(function () {
                    return policies;
                });
            })
        }

        function getServicePolicyDetails(orgId, svcId, versionId, policyId) {
            return ServiceVersionPolicy.get({
                orgId: orgId,
                svcId: svcId,
                versionId: versionId,
                policyId: policyId
            }).$promise;
        }

        function getMktServicePolicyDetails(orgId, svcId, versionId, policyId) {
            return MktServiceVersionPolicy.get({
                orgId: orgId,
                svcId: svcId,
                versionId: versionId,
                policyId: policyId
            }).$promise;
        }

        function getPolicyDefinition(policyId) {
            return PolicyDefs.get({policyId: policyId}).$promise;
        }

        function isConfigurable(policyDefinitionId) {
            return !_.find(['ACL', 'HAL', 'JWT', 'JWTUp', 'DataDog'], function (o) {
                return o === policyDefinitionId;
            });
        }

        function updatePlanPolicy(orgId, planId, versionId, policyId, jsonConfig, enabled) {
            var policyObj = {
                configuration: jsonConfig,
                enabled: enabled
            };
            return PlanVersionPolicy.update({
                orgId: orgId,
                planId: planId,
                versionId: versionId,
                policyId: policyId
            }, policyObj).$promise;
        }

        function updateServicePolicy(orgId, svcId, versionId, policyId, jsonConfig, enabled) {
            var policyObj = {
                configuration: jsonConfig,
                enabled: enabled
            };
            return ServiceVersionPolicy.update({
                orgId: orgId,
                svcId: svcId,
                versionId: versionId,
                policyId: policyId
            }, policyObj).$promise;
        }

    }

})();
