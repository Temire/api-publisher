;(function() {
    'use strict';

    angular.module('app.api')

    /// ==== Service Doc Main Controller
        .controller('ApiDocCtrl', apiDocCtrl)
        .controller('DocumentationCtrl', documentationCtrl)
        .controller('SvcPlanCtrl', svcPlanCtrl)
        .controller('AnnouncementCtrl', announcementCtrl)
        .controller('SupportCtrl', supportCtrl)
        .controller('TermsCtrl', termsCtrl);
    

    function apiDocCtrl($scope, $rootScope, $uibModal, endpoint, svcData, versions, svcModel, svcTab, loginHelper, oAuthPolicy,
                        headerModel, toastService, followerService, support, CONFIG, EVENTS, _) {
        headerModel.setIsButtonVisible(true, true, true);
        svcModel.setService(svcData);
        $scope.serviceVersion = svcData;
        $scope.endpoint = endpoint;
        $scope.oAuthConfig = angular.fromJson(oAuthPolicy.configuration);
        $scope.deprecated = $scope.serviceVersion.status === 'Deprecated';
        $scope.published = $scope.serviceVersion.status === 'Published';
        $scope.retired = $scope.serviceVersion.status === 'Retired';
        $scope.hasOAuth = !_.isEmpty(oAuthPolicy);
        $scope.displayTab = svcTab;
        $scope.loggedIn = loginHelper.checkLoggedIn();
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.support = support;
        $scope.modalAnim = 'default';
        $scope.modalSelectApplicationForContract = modalSelectApplicationForContract;
        $scope.modalClose = modalClose;
        $scope.hasTerms = hasTerms;
        $scope.userIsFollowing =
            $scope.serviceVersion.service.followers.indexOf($scope.User.currentUser.username) > -1;
        $scope.followAction = followAction;
        $scope.copyPath = copyPath;
        $scope.availableVersions = _.filter(versions, function (v) {
            return v.status === 'Published' || v.status === 'Deprecated';
        });


        $rootScope.$broadcast(EVENTS.API_DETAILS_PAGE_OPENED);

        function hasTerms() {
            return $scope.serviceVersion.service.terms !== null &&
                $scope.serviceVersion.service.terms.length > 0;
        }

        function modalSelectApplicationForContract() {
            $uibModal.open({
                templateUrl: 'views/modals/planSelect.html',
                size: 'lg',
                controller: 'PlanSelectCtrl as ctrl',
                resolve: {
                    serviceVersion: $scope.serviceVersion,
                    ServiceVersionPolicy: 'ServiceVersionPolicy',
                    svcPolicies: function (ServiceVersionPolicy) {
                        return ServiceVersionPolicy.query(
                            {orgId: $scope.serviceVersion.service.organization.id,
                                svcId: $scope.serviceVersion.service.id,
                                versionId: $scope.serviceVersion.version}).$promise.then(
                            function (data) {
                                return data;
                            },
                            function (error) {
                                toastService.warning(error.data.message);
                                throw new Error('<b>Service does not exist anymore!</b><br><span class="small">This error occurs when the service was available when loading the page, but in meantime has been retired, or otherwise deleted from the publisher.</span>');
                            });
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

        function modalClose() {
            $scope.$close();	// this method is associated with $uibModal scope which is this.
        }

        function followAction() {
            if ($scope.userIsFollowing) {
                followerService.removeFollower($scope.serviceVersion);
            } else {
                followerService.addFollower($scope.serviceVersion);
            }
        }
        
        function copyPath() {
            toastService.info('<b>Path copied!</b>');
        }
    }

    /// ==== Service Swagger Documentation Controller
    function documentationCtrl ($scope, $stateParams, $timeout, svcContracts, oAuthPolicy, jwtEnabled, userApps,
                                docTester, docDownloader, svcTab, ApplicationVersion, apiService,
                                oAuthService, toastService, TOAST_TYPES, _) {
        $scope.addHeader = addHeader;
        $scope.oAuthConfig = angular.fromJson(oAuthPolicy.configuration);
        $scope.docDownloader = docDownloader;
        $scope.docTester = docTester;
        $scope.copy = copy;
        $scope.contractApps = [];
        $scope.canGrant = canGrant;
        $scope.customHeaders = [];
        $scope.doGrant = doGrant;
        $scope.hasGrant = false;
        $scope.jwtEnabled = jwtEnabled;
        $scope.removeHeader = removeHeader;
        $scope.selectedScopes = [];
        $scope.selectContract = selectContract;
        $scope.toggleOAuthPanel = toggleOAuthPanel;


        init();

        function init() {
            $scope.isLoading = true;
            svcTab.updateTab('Documentation');

            // Initially all requested scopes will be selected
            angular.forEach($scope.serviceVersion.oauthScopes, function (value, key) {
                $scope.selectedScopes.push({scope: key, desc: value, checked: true});
            });

            // But oAuth panel is closed
            $scope.oAuthClosed = true;
            $scope.oAuthPanelStyle = {
                'border-bottom': '0'
            };

            filterApplications(userApps, svcContracts);

            if ($scope.contractApps.length > 0) {
                if (docTester.preferredContract) {
                    if (_.find($scope.contractApps,
                            function (c) { return c.contractId === docTester.preferredContract.contractId; })) {
                        $scope.selectedContract = docTester.preferredContract;
                    } else {
                        $scope.selectedContract = $scope.contractApps[0];
                    }
                } else {
                    $scope.selectedContract = $scope.contractApps[0];
                }
                docTester.setPreferredContract($scope.selectedContract);
                updateOAuthInfo($scope.selectedContract);
            } else {
                $scope.selectedContract = undefined;
            }

            apiService.getServiceVersionDefinition($stateParams.orgId, $stateParams.svcId, $stateParams.versionId)
                .then(function (definitionSpec) {
                    $scope.currentDefinitionSpec = definitionSpec;
                    $timeout(function () {
                        $scope.isLoading = false;
                    }, 100);
                });
        }

        function addHeader() {
            $scope.customHeaders.push({name: '', value: ''});
        }

        function copy(field) {
            toastService.createToast(TOAST_TYPES.INFO, '<b>' + field + '</b> copied to clipboard!', true);
        }

        function filterApplications(apps, contracts) {
            var match = function (app, contract) {
                return (app.id === contract.appId && app.organizationId === contract.appOrganizationId);
            };

            for (var i = 0; i < contracts.length; i++) {
                for (var j = 0; j < apps.length; j++) {
                    if (match(apps[j], contracts[i])) {
                        $scope.contractApps.push(contracts[i]);
                        break;
                    }
                }
            }
        }

        function selectContract(contract) {
            $scope.selectedContract = contract;
            if ($scope.hasOAuth) {
                updateOAuthInfo(contract);
            }
        }

        function updateOAuthInfo(contract) {
            ApplicationVersion.get(
                {orgId: contract.appOrganizationId,
                    appId: contract.appId,
                    versionId: contract.appVersion},
                function (reply) {
                    $scope.appVersion = reply;
                }
            );
        }

        function canGrant() {
            var canDoGrant = false;
            if ($stateParams.scopes == undefined || $stateParams.scopes == null) return true;
            angular.forEach($scope.selectedScopes, function (value) {
                if (value.checked) {
                    canDoGrant = true;
                }
            });
            return canDoGrant;
        }

        function doGrant() {
            oAuthService.grant(
                $scope.endpoint.oauth2AuthorizeEndpoint,
                $scope.appVersion.oAuthClientId,
                $scope.appVersion.oauthClientSecret,
                'token',
                $scope.selectedScopes,
                $scope.serviceVersion.provisionKey,
                $scope.User.currentUser.username
            ).then(function (response) {
                if (processUri(response.data.redirect_uri)) {
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        '<b>Grant successful!</b><br>You can now use the try-out functionality.', true);
                    $scope.hasGrant = true;
                } else {
                    toastService.createErrorToast(new Error('Could not process redirect URI'),
                        'Could not complete grant process');
                }
            }, function (error) {
                toastService.createErrorToast(error, 'Could not complete grant process');
            });
        }

        function processUri(uri) {
            var paramStart = uri.indexOf('access_token=');
            if (paramStart > -1) {
                var paramString = uri.substr(paramStart + 13);
                //remove every param that are send after bearer token
                var n = paramString.indexOf('&');
                paramString = paramString.substring(0, n != -1 ? n : s.length);
                var headerObj = {
                    name: 'Authorization',
                    value: 'Bearer ' + paramString
                };
                $scope.customHeaders.push(headerObj);
                return true;
            } else {
                return false;
            }
        }

        function removeHeader(header) {
            $scope.customHeaders.splice($scope.customHeaders.indexOf(header), 1);
        }

        function toggleOAuthPanel() {
            $scope.oAuthClosed = !$scope.oAuthClosed;
            if ($scope.oAuthClosed) {
                $scope.oAuthPanelStyle = {
                    'border-bottom': '0'
                };
            } else {
                $scope.oAuthPanelStyle = {};
            }
        }
    }

    /// ==== Service Plans Controller
    function svcPlanCtrl($scope, $stateParams, svcTab, svcPolicies,
                         planData, policyConfig, PlanVersionPolicy) {
        $scope.svcPolicies = svcPolicies;
        $scope.plans = planData;
        $scope.policies = [];
        $scope.policyConfiguration = [];

        init();

        function init() {
            svcTab.updateTab('Plans');
            angular.forEach($scope.plans, function (plan) {
                getPlanPolicies(plan);
            });
        }

        function getPolicyDetails(policy, plan) {
            PlanVersionPolicy.get(
                {orgId: $stateParams.orgId, planId: plan.planId, versionId: plan.version, policyId: policy.id},
                function (policyDetails) {
                    $scope.policyConfiguration[policyDetails.id] =
                        policyConfig.createConfigObject(policyDetails);
                });
        }

        function getPlanPolicies(plan) {
            PlanVersionPolicy.query(
                {orgId: $stateParams.orgId, planId: plan.planId, versionId: plan.version},
                function (policies) {
                    $scope.policies[plan.planId] = policies;
                    angular.forEach(policies, function (policy) {
                        getPolicyDetails(policy, plan);
                    });
                });
        }
    }

    /// ==== Service Announcements Controller
    function announcementCtrl($scope, svcTab, announcements, Users) {
        $scope.announcements = announcements;
        $scope.selected = {
            announcement: null,
            user: null
        };
        $scope.switchNotification = switchNotification;

        init();

        function init() {
            svcTab.updateTab('Announcements');
            if (announcements.length > 0) {
                Users.get({userId: announcements[0].createdBy}, function (reply) {
                    $scope.selected = {
                        announcement: announcements[0],
                        user: reply
                    };
                });
            }
        }

        function switchNotification(announcement) {
            Users.get({userId: announcement.createdBy}, function (reply) {
                $scope.selected.user = reply;
                $scope.selected.announcement = announcement;
            });
        }
    }

    /// ==== Service Support Controller
    function supportCtrl ($scope, svcTab) {

        svcTab.updateTab('Support');

    }

    /// ==== Service Terms Controller
    function termsCtrl ($scope, svcTab) {

        svcTab.updateTab('Terms');

    }

    // #end
})();
