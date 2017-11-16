(function () {
    'use strict';

    angular.module('app.contracts')
        .directive('apimPendingContractsForService', pendingContractsForSvc);


    function pendingContractsForSvc() {
        return {
            restrict: 'E',
            scope: {
                contracts: '=',
                canAccept: '='
            },
            templateUrl: 'views/templates/contracts/pending-contracts-for-svc.html',
            controller: function ($scope, contractService, currentUserModel, toastService) {
                $scope.acceptContract = acceptContract;
                $scope.getPlanDetails = getPlanDetails;
                $scope.rejectContract = rejectContract;

                function acceptContract(contract) {
                    contractService.accept(contract).then(function () {
                        toastService.success('Contract with <b>' + contract.appDetails.application.name + ' '
                            +  contract.appDetails.version + '</b> accepted.');
                        $scope.contracts.splice($scope.contracts.indexOf(contract), 1);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not accept contract');
                    })
                }
                
                function getPlanDetails(contract) {
                    if (!contract.planDetails) contract.planDetails = angular.fromJson(contract.body);
                    return contract.planDetails;
                }
                
                function rejectContract(contract) {
                    contractService.reject(contract).then(function () {
                        toastService.info('Contract with <b>' + contract.appDetails.application.name + ' '
                            +  contract.appDetails.version + '</b> rejected.');
                        $scope.contracts.splice($scope.contracts.indexOf(contract), 1);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not reject contract');
                    })
                }
            }
        }
    }
})();
