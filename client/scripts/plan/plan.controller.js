(function () {
    'use strict';

    angular.module('app.plan')
        .controller('PlanCtrl', planCtrl)
        .controller('PlanActivityCtrl', planActivityCtrl)
        .controller('PlanPoliciesCtrl', planPoliciesCtrl)
        .controller('DeletePlanVersionCtrl', deletePlanVersionCtrl);


    function planCtrl($scope, $uibModal, $state, $stateParams, orgData, orgScreenModel, planScreenModel,
                      planData, planVersions, planManager, actionService, toastService, TOAST_TYPES, Plan) {

        $scope.planVersion = planData;
        $scope.versions = planVersions;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.confirmLockPlan = confirmLockPlan;
        $scope.confirmDeleteVersion = confirmDeleteVersion;
        $scope.lockPlan = lockPlan;
        $scope.selectVersion = selectVersion;
        $scope.updateDesc = updateDesc;
        $scope.showInfoModal = showInfoModal;
        $scope.locked = $scope.planVersion.status === 'Locked';
        init();

        function init() {
            orgScreenModel.updateOrganization(orgData);
            planScreenModel.updatePlan(planData);
        }

        function lockPlan() {
            actionService.lockPlan($scope.planVersion, true);
        }

        function confirmDeleteVersion() {
            planManager.deleteVersion($scope.planVersion.plan.organization.id,
                $scope.planVersion.plan.id, $scope.planVersion.plan.name,
                $scope.planVersion.version).then(function () {
                toastService.success('<b>Plan Version deleted.</b>');

                // TODO Redirect? If other versions, redirect to highest, else redirect to dashboard
                $state.go('root.organization.plans', { orgId: $scope.planVersion.plan.organization.id });

            }, function (error) {
                toastService.createErrorToast(error, 'Could not delete application version!');
            })
        }

        function selectVersion(version) {
            $state.go($state.$current.name,
                {orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: version.version});
        }

        function updateDesc(newValue) {
            planManager.updatePlanDescription($stateParams.orgId, $stateParams.planId, newValue).then(function () {
                toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update plan\'s description.');
            });
        }

        function confirmLockPlan() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/modals/planLock.html',
                size: 'lg',
                controller: 'LockPlanCtrl as ctrl',
                resolve: {
                    planVersion: function () {
                        return $scope.planVersion;
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

            modalInstance.result.then(function () {
                actionService.lockPlan($scope.planVersion, false).then(function () {
                    $state.forceReload();
                });
            })
        }

        function showInfoModal() {
            $uibModal.open({
                templateUrl: 'views/modals/helpView.html',
                size: 'lg',
                controller: 'HelpCtrl as ctrl',
                resolve: {
                    type: function () {
                        return 'plan';
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }
    }

    function planActivityCtrl($scope, activityData) {
        $scope.activities = activityData.beans;

    }

    function planPoliciesCtrl($scope, $uibModal, policyData) {
        $scope.policies = policyData;
        $scope.modalAddPolicy = modalAddPolicy;

        function modalAddPolicy() {
            $uibModal.open({
                templateUrl: 'views/modals/policyAdd.html',
                size: 'lg',
                controller: 'AddPolicyCtrl as ctrl',
                resolve: {
                    policyDefs: function (PolicyDefs) {
                        return PolicyDefs.query({}).$promise;
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }
    }

    function deletePlanVersionCtrl($scope, $uibModalInstance, planName, planVersion, lastVersion) {
        $scope.planName = planName;
        $scope.planVersion = planVersion;
        $scope.lastVersion = lastVersion;
        $scope.modalClose = modalClose;
        $scope.doDelete = doDelete;

        function modalClose() {
            $uibModalInstance.dismiss("cancel");
        }

        function doDelete() {
            $uibModalInstance.close("OK");
        }
    }

})();
