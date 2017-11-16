(function () {
    'use strict';

    angular.module('app.ui')
        .component('apiPageBreadcrumbs', {
            template: '<div class="api-row breadcrumbs" style="background: #eee">' +
                        '<div class="api-content-container">' +
                            '<div class="panel" style="border: 0; background: #eee">' +
                                '<ol class="breadcrumb breadcrumb-small mb0" style="background: #eee" ng-transclude>' +
                                '</ol>' +
                            '</div>' +
                        '</div>' +
                    '</div>',
            transclude: true
        })
        .component('apiPageHeader', {
            templateUrl: 'views/components/ui/component-page-header.html',
            bindings: {
                'hasLogo': '<'
            },
            transclude: {
                'logoSlot': '?base64Logo',
                'headerSlot': 'div'
            }
        })
        .component('apiPageActions', {
            templateUrl: 'views/components/ui/component-actions.html',
            transclude: true
        })
        .component('apiPageVersionSelect', {
            templateUrl: 'views/components/ui/component-version-select.html',
            bindings: {
                'currentVersion': '=',
                'type': '=',
                'versions': '='
            },
            controller: function ($state, $stateParams) {
                this.selectVersion = selectVersion;

                function selectVersion(version) {
                    switch (this.type) {
                        case 'app':
                            $state.go($state.$current.name,
                                {orgId: $stateParams.orgId, appId: $stateParams.appId, versionId: version.version});
                            break;
                        case 'svc':
                            $state.go($state.$current.name,
                                {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: version.version});
                            break;
                        case 'plan':
                            $state.go($state.$current.name,
                                {orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: version.version});
                            break;
                    }
                }
            }
        });

})();
