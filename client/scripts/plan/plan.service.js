(function () {
    'use strict';

    angular.module('app.plan') 
        .service('planManager', planManager)
        .service('planScreenModel', planScreenModel);

    
    function planManager($q, $uibModal, Plan, PlanVersion) {
        this.updatePlanDescription = updatePlanDescription;
        this.deleteVersion = deleteVersion;
        this.getPlanVersions = getPlanVersions;
        
        function updatePlanDescription(orgId, planId, newDesc) {
            return Plan.update({orgId: orgId, planId: planId }, {description: newDesc}).$promise;
        }

        function getPlanVersions(orgId, planId) {
            return PlanVersion.query({ orgId: orgId, planId: planId }).$promise
        }

        function deleteVersion(organizationId, planId, planName, planVersion) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/planVersionDelete.html',
                size: 'lg',
                controller: 'DeletePlanVersionCtrl as ctrl',
                resolve: {
                    planName: function () {
                        return planName;
                    },
                    planVersion: function () {
                        return planVersion
                    },
                    lastVersion: function () {
                        return getPlanVersions(organizationId, planId).then(function (versions) {
                            return versions.length === 1;
                        })
                    }
                },
                backdrop : 'static'
            });
            modalInstance.result.then(function() {
                deferred.resolve(PlanVersion.delete({ orgId: organizationId, planId: planId, versionId: planVersion}).$promise);
            });
            return deferred.promise;
        }
    }
    
    function planScreenModel() {
        this.plan = {};

        this.updatePlan = function (plan) {
            this.plan = plan;
        };
    }

})();
