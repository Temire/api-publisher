(function () {
    'use strict';

    angular.module('app.core.routes', ['ui.router'])

    // UI-Router states

    // UI-Router Routing Config
        .config(function ($stateProvider, $urlRouterProvider) {

            // UI-Router Conditional Redirects
            $urlRouterProvider.otherwise('/my-organizations');
            $urlRouterProvider.when('/org/{orgId}/api/{svcId}/{versionId}', '/org/{orgId}/api/{svcId}/{versionId}/documentation');
            $urlRouterProvider.when('/org/{orgId}', '/org/{orgId}/plans');
            $urlRouterProvider.when('/org/{orgId}/application/{appId}/{versionId}', '/org/{orgId}/application/{appId}/{versionId}/overview');
            $urlRouterProvider.when('/org/{orgId}/service/{svcId}/{versionId}', '/org/{orgId}/service/{svcId}/{versionId}/overview');
            $urlRouterProvider.when('/org/{orgId}/plan/{planId}/{versionId}', '/org/{orgId}/plan/{planId}/{versionId}/policies');
            $urlRouterProvider.when('/org/{orgId}/dash', '/org/{orgId}/dash/applications');


            // UI-Router States
            $stateProvider

            // ERROR PAGE =====================================================================
                .state('root.error', {
                    templateUrl: '/views/error.html',
                    controller: 'ErrorCtrl'
                })
                .state('root.maintenance', {
                    templateUrl: '/views/maintenanceLogin.html',
                    controller: 'ErrorCtrl'
                })
                .state('accessdenied', {
                    templateUrl: '/views/accessdenied.html',
                    controller: 'AccessDeniedCtrl'
                })

                // OAUTH GRANT PAGE ===============================================================
                .state('oauth', {
                    url: '/oauth?response_type&client_id&org_id&service_id&version&authenticatedUserId&scopes&apikey',
                    templateUrl: '/views/oauth.html',
                    controller: 'OAuthCtrl'
                })

                // LOGOUT PAGE ====================================================================
                .state('logout', {
                    url: '/logout',
                    templateUrl: '/views/logout.html',
                    controller: 'LogoutCtrl'
                })

                // ROOT STATE =====================================================================
                .state('root', {
                    templateUrl: '/views/partials/root.html',
                    resolve: {
                        currentUserModel: 'currentUserModel',
                        currentUserInfo: function (currentUserModel, loginHelper) {
                            if (loginHelper.checkJWTInSession()) return currentUserModel.refreshCurrentUserInfo(currentUserModel);
                            else {
                                return {};
                            }
                        },
                        notificationService: 'notificationService',
                        notifications: function (notificationService, loginHelper) {
                            if (loginHelper.checkLoggedIn()) return notificationService.getNotificationsForUser();
                            else return [];
                        },
                        pendingNotifications: function (notificationService, loginHelper) {
                            if (loginHelper.checkLoggedIn()) return notificationService.getPendingNotificationsForUser();
                            else return [];
                        }
                    },
                    controller: 'HeadCtrl as ctrl'
                })

                // UX Improvements testing state
                .state('root.ux', {
                    url: '/ux',
                    templateUrl: 'views/ux.html'
                })

                // MARKETPLACE CONSUMER DASHBOARD =================================================
                .state('root.market-dash', {
                    url: '/org/:orgId/dash',
                    templateUrl: '/views/market-dashboard.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        }
                    },
                    controller: 'MarketDashCtrl'
                })
                .state('root.market-dash.applications', {
                    url: '/applications',
                    params: {
                        mode: null
                    },
                    templateUrl: '/views/partials/market/applications.html',
                    resolve: {
                        appData: function ($q, organizationId, currentUser) {
                            var appData = [];
                            return currentUser.getUserApps().then(function (results) {
                                angular.forEach(results, function (app) {
                                    if (app.organizationId === organizationId) {
                                        appData.push(app);
                                    }
                                });
                                return appData;
                            });
                        },
                        appService: 'appService',
                        appVersions: function ($q, appData, appService) {
                            var promises = [];

                            angular.forEach(appData, function (app) {
                                promises.push(appService.getAppVersions(app.organizationId, app.id).then(function (appVersions) {
                                    app.versions = appVersions;
                                }));
                            });
                            return $q.all(promises);
                        },
                        appVersionDetails: function ($q, appData, appVersions, appService) {
                            var promises = [];
                            
                            angular.forEach(appData, function (app) {
                                angular.forEach(app.versions, function (appVersion) {
                                    promises.push(
                                        appService.getAppVersionDetails(appVersion.organizationId, appVersion.id, appVersion.version).then(function (versionDetails) {
                                           appVersion.details = versionDetails; 
                                        }));
                                })
                            });
                            
                            return $q.all(promises);
                        },
                        appContracts: function ($q, appData, appVersions, appService) {
                            var promises = [];
                            angular.forEach(appData, function (app) {
                                angular.forEach(app.versions, function (appVersion) {
                                    promises.push(appService.getAppVersionContracts(appVersion.organizationId, appVersion.id, appVersion.version).then(function (versionContracts) {
                                        appVersion.contracts = versionContracts;
                                        appVersion.pendingContracts = [];
                                    }))
                                });
                            });
                            return $q.all(promises);
                        },
                        contractService: 'contractService',
                        pendingContracts: function (organizationId, contractService) {
                            return contractService.outgoingPendingForOrg(organizationId);
                        },
                        Gateways: 'Gateways',
                        gateways: function (Gateways) {
                            return Gateways.query().$promise;
                        }
                    },
                    controller: 'MarketAppsCtrl'
                })

                // MARKETPLACE MEMBER MANAGEMENT
                .state('root.market-dash.members', {
                    url: '/members',
                    templateUrl: '/views/partials/market/members.html',
                    resolve: {
                        memberService: 'memberService',
                        memberData: function (memberService, organizationId) {
                            return memberService.getMembersForOrg(organizationId);
                        },
                        Roles: 'Roles',
                        roleData: function (Roles) {
                            return Roles.query().$promise;
                        },
                        userService: 'userService',
                        requests: function ($q, $stateParams, memberService, userService) {
                            var deferred = $q.defer();
                            memberService.getPendingRequests($stateParams.orgId).then(function (requests) {
                                var promises = [];
                                requests.forEach(function (req) {
                                    promises.push(userService.getUserDetails(req.userId).then(function (results) {
                                        req.userDetails = results;
                                    }));
                                });
                                $q.all(promises).then(function () {
                                    deferred.resolve(requests);
                                });
                            });
                            return deferred.promise;
                        }
                    },
                    controller: 'MarketMembersCtrl'
                })

                // MARKETPLACE API EXPLORER AND NESTED VIEWS =======================================
                .state('root.apis', {
                    abstract: true,
                    url: '/apis',
                    templateUrl: '/views/dashboard.html',
                    resolve: {
                        apiService: 'apiService',
                        svcData: function (apiService) {
                            return apiService.getMarketplaceApis();
                        },
                        categories: function (apiService) {
                            return apiService.getPublishedCategories();
                        }
                    },
                    controller: 'DashboardCtrl'
                })
                // API Grid View
                .state('root.apis.grid', {
                    url: '/grid',
                    templateUrl: 'views/partials/dashboard/grid.html'

                })
                // API List View
                .state('root.apis.list', {
                    url: '/list',
                    templateUrl: 'views/partials/dashboard/list.html'
                })

                // MARKETPLACE API SEARCH ============================================================
                .state('root.search', {
                    url: '/search?query',
                    templateUrl: '/views/search.html',
                    resolve: {
                        apiService: 'apiService',
                        svcData: function (apiService, $stateParams) {
                            return apiService.searchMarketplaceApis($stateParams.query);
                        }
                    },
                    controller: 'ApiSearchCtrl'
                })

                // API MARKETPLACE PAGE AND NESTED VIEWS ==============================================
                .state('root.api', {
                    url: '/org/:orgId/api/:svcId/:versionId',
                    templateUrl: 'views/api.html',
                    resolve: {
                        apiService: 'apiService',
                        svcData: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceVersion(organizationId, serviceId, versionId);
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        serviceId: function ($stateParams) {
                            return $stateParams.svcId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        },
                        versions: function (apiService, organizationId, serviceId) {
                            return apiService.getServiceVersions(organizationId, serviceId);
                        },
                        support: function (apiService, organizationId, serviceId) {
                            return apiService.getServiceSupportTickets(organizationId, serviceId);
                        },
                        endpoint: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceEndpoint(organizationId, serviceId, versionId);
                        },
                        svcPolicies: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceVersionPolicies(organizationId, serviceId, versionId);
                        },
                        oAuthPolicy: function ($q, apiService, svcPolicies, organizationId, serviceId, versionId) {
                            var oAuthPolicy = {};
                            var promises = [];

                            angular.forEach(svcPolicies, function (policy) {
                                if (policy.policyDefinitionId === 'OAuth2') {
                                    promises.push(apiService.getServiceVersionPolicy(organizationId, serviceId, versionId, policy.id));
                                }
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (details) {
                                    oAuthPolicy = details;
                                });
                                return oAuthPolicy;
                            });
                        }
                    },
                    controller: 'ApiDocCtrl'
                })
                // Announcements Tab
                .state('root.api.announcements', {
                    url: '/announcements',
                    templateUrl: 'views/partials/api/announcements.html',
                    resolve: {
                        apiService: 'apiService',
                        announcements: function (apiService, organizationId, serviceId) {
                            return apiService.getServiceAnnouncements(organizationId,serviceId);
                        }
                    },
                    controller: 'AnnouncementCtrl'
                })
                // Documentation Tab
                .state('root.api.documentation', {
                    url: '/documentation',
                    templateUrl: 'views/partials/api/documentation.html',
                    resolve: {
                        apiService: 'apiService',
                        loginHelper: 'loginHelper',
                        serviceVersion: function (apiService, loginHelper, organizationId, serviceId, versionId) {
                            if (loginHelper.checkLoggedIn()) {
                                return apiService.getServiceVersion(organizationId, serviceId, versionId);
                            } else {
                                return null;
                            }
                        },
                        svcContracts: function (apiService, loginHelper, organizationId, serviceId, versionId) {
                            if (loginHelper.checkLoggedIn()) {
                                return apiService.getServiceVersionContracts(organizationId, serviceId, versionId);
                            } else {
                                return [];
                            }
                        },
                        svcPolicies: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceVersionPolicies(organizationId, serviceId, versionId);
                        },
                        oAuthPolicy: function ($q, apiService, svcPolicies, organizationId, serviceId, versionId) {
                            var oAuthPolicy = {};
                            var promises = [];

                            angular.forEach(svcPolicies, function (policy) {
                                if (policy.policyDefinitionId === 'OAuth2') {
                                    promises.push(apiService.getServiceVersionPolicy(organizationId, serviceId, versionId, policy.id));
                                }
                            });

                            return $q.all(promises).then(function (results) {
                                angular.forEach(results, function (details) {
                                    oAuthPolicy = details;
                                });
                                return oAuthPolicy;
                            });
                        },
                        jwtEnabled: function (svcPolicies, serviceVersion) {
                            var jwt = false;
                            angular.forEach(svcPolicies, function (policy) {
                                if (policy.policyDefinitionId === 'JWT') {
                                    jwt = true;
                                }
                                if (serviceVersion && serviceVersion.service && serviceVersion.service.admin) {
                                    jwt = true;
                                }
                            });
                            return jwt;
                        },
                        currentUser: 'currentUser',
                        userApps: function (currentUser, loginHelper) {
                            if (loginHelper.checkLoggedIn()) return currentUser.getUserApps();
                            else return [];
                        }
                    },
                    controller: 'DocumentationCtrl'
                })
                // Plans Tab
                .state('root.api.plans', {
                    url: '/plans',
                    templateUrl: 'views/partials/api/plans.html',
                    resolve: {
                        policyService: 'policyService',
                        svcPolicies: function (policyService, organizationId, serviceId, versionId) {
                            return policyService.getServicePoliciesWithDetailsForMarket(organizationId, serviceId, versionId);
                        },
                        planData: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServicePlans(organizationId, serviceId, versionId);
                        }
                    },
                    controller: 'SvcPlanCtrl'
                })
                // Scopes Tab
                .state('root.api.scopes', {
                    url: '/scopes',
                    templateUrl: 'views/partials/api/scopes.html',
                    resolve: {
                        apiService: 'apiService',
                        serviceMarketplaces: function (apiService, organizationId, serviceId, versionId) {
                            return apiService.getServiceAvailability(organizationId, serviceId, versionId);
                        },
                        servicePolicies: function(apiService, organizationId, serviceId, versionId){
                            return apiService.getServicePolicies(organizationId, serviceId, versionId);
                        }
                    },
                    controller: 'SvcScopeCtrl'
                })
                // Support Tab
                .state('root.api.support', {
                    url: '/support',
                    templateUrl: 'views/partials/api/support.html',
                    controller: 'SupportCtrl'
                })
                // Terms Tab
                .state('root.api.terms', {
                    url: '/terms',
                    templateUrl: 'views/partials/api/terms.html',
                    controller: 'TermsCtrl'
                })

                // ORGANIZATION OVERVIEW PAGE AND NESTED VIEWS ====================================
                .state('root.organization', {
                    url: '/org/:orgId',
                    templateUrl: 'views/organization.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, $stateParams) {

                            var orgId = $stateParams.orgId;

                            return Organization.get({id: orgId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        contractService: 'contractService',
                        pendingContracts: function ($stateParams, contractService) {
                            return contractService.incomingPendingForOrg($stateParams.orgId);
                        },
                        userService: 'userService',
                        pendingMemberships: function ($q, $stateParams, memberService, userService) {
                            var deferred = $q.defer();
                            memberService.getPendingRequests($stateParams.orgId).then(function (requests) {
                                var promises = [];
                                requests.forEach(function (req) {
                                    promises.push(userService.getUserDetails(req.userId).then(function (results) {
                                        req.userDetails = results;
                                    }));
                                });
                                $q.all(promises).then(function () {
                                    deferred.resolve(requests);
                                });
                            });
                            return deferred.promise;
                        }
                    },
                    controller: 'OrganizationCtrl'
                })
                // Services View
                .state('root.organization.services', {
                    url: '/services',
                    templateUrl: 'views/partials/organization/services.html',
                    resolve: {
                        service: 'service',
                        svcData: function ($q, service, organizationId) {
                            return service.getServicesForOrg(organizationId).then(function (services) {
                                var promises = [];
                                angular.forEach(services, function (svc) {
                                    promises.push(service.getServiceVersions(organizationId, svc.id).then(function (versions) {
                                        svc.versions = versions;
                                    }));
                                });
                                return $q.all(promises).then(function () {
                                    return services;
                                });
                            });
                        }
                    },
                    controller: 'ServicesCtrl'
                })
                // Plans View
                .state('root.organization.plans', {
                    url: '/plans',
                    templateUrl: 'views/partials/organization/plans.html',
                    resolve: {
                        Plan: 'Plan',
                        planData: function (Plan, organizationId) {
                            return Plan.query({orgId: organizationId}).$promise;
                        },
                        PlanVersion: 'PlanVersion',
                        planVersions: function ($q, planData, PlanVersion) {
                            var promises = [];

                            angular.forEach(planData, function (plan) {
                                promises.push(PlanVersion.query(
                                    {orgId: plan.organizationId, planId: plan.id}).$promise.then(function (planVersions) {
                                    plan.versions = planVersions;
                                }));
                            });

                            return $q.all(promises);
                        }
                    },
                    controller: 'PlansCtrl'
                })
                // Members View
                .state('root.organization.members', {
                    url: '/members',
                    templateUrl: 'views/partials/organization/members.html',
                    resolve: {
                        memberService: 'memberService',
                        memberData: function (memberService, organizationId) {
                            return memberService.getMembersForOrg(organizationId);
                        },
                        Roles: 'Roles',
                        roleData: function (Roles) {
                            return Roles.query().$promise;
                        }
                    },
                    controller: 'MembersCtrl'
                })
                // Pending Members View
                .state('root.organization.pending', {
                    url: '/pending',
                    templateUrl: 'views/partials/organization/pending.html',
                    controller: 'PendingCtrl'
                })

                // ADMINISTRATION OVERVIEW PAGE =================================================
                .state('root.administration', {
                    url: '/administration',
                    templateUrl: 'views/administration.html',
                    controller: 'AdministrationCtrl'
                })
                // Admin Users View
                .state('root.administration.users', {
                    url: '/admins',
                    templateUrl: 'views/partials/administration/users.html',
                    resolve: {
                        Admins: 'Admins',
                        adminData: function(Admins){
                            return Admins.query().$promise;
                        }
                    },
                    controller: 'AdminUsersCtrl'
                })
                .state('root.administration.branding', {
                    url: '/branding',
                    templateUrl: 'views/partials/administration/branding.html',
                    resolve: {
                        BrandingService: 'BrandingService',
                        brandingData: function(BrandingService){
                            return BrandingService.getBrandings();
                        }
                    },
                    controller: 'AdminBrandingCtrl'
                })
                .state('root.administration.security', {
                    url: '/expiration',
                    templateUrl: 'views/partials/administration/security.html',
                    resolve: {
                        OAuthCentralExpTime: 'OAuthCentralExpTime',
                        oauthExp: function(OAuthCentralExpTime){
                            return OAuthCentralExpTime.get().$promise;
                        },
                        JWTCentralExpTime: 'JWTCentralExpTime',
                        jwtExp: function(JWTCentralExpTime){
                            return JWTCentralExpTime.get().$promise;
                        }
                    },
                    controller: 'AdminExpirationCtrl'
                })                
                .state('root.administration.terms', {
                    url: '/terms',
                    templateUrl: 'views/partials/administration/terms.html',
                    resolve: {
                        service: 'service',
                        currentTerms: function (service) {
                            return service.getDefaultTerms();
                        }
                    },
                    controller: 'AdminTermsCtrl'
                })

                // Admin Status View
                .state('root.administration.status', {
                    url: '/status',
                    templateUrl: 'views/partials/administration/status.html',
                    resolve: {
                        adminHelper: 'adminHelper',
                        status: function (adminHelper) {
                            return adminHelper.getStatus();
                        }
                    },
                    controller: 'AdminStatusCtrl'
                })

                // ORGANIZATIONS SEARCH PAGE ======================================================
                .state('root.organizations', {
                    url: '/organizations',
                    templateUrl: 'views/organizations.html',
                    resolve: {
                        currentUser: 'currentUser',
                        svcOrgData: function (currentUser) {
                            return currentUser.getUserSvcOrgs();
                        },
                        orgService: 'orgService',
                        orgs: function (orgService) {
                            return orgService.search();
                        },
                        notificationService: 'notificationService',
                        pendingOrgs: function (notificationService) {
                            return notificationService.getOrgsWithPendingRequest()
                        }
                    },
                    controller: 'OrganizationsCtrl'
                })

                // MY ORGANIZATIONS OVERVIEW PAGE =================================================
                .state('root.myOrganizations', {
                    url: '/my-organizations',
                    params: {
                        mode: null
                    },
                    templateUrl: 'views/my-organizations.html',
                    resolve: {
                        currentUser: 'currentUser',
                        svcOrgData: function (currentUser) {
                            return currentUser.getUserSvcOrgs();
                        }
                    },
                    controller: 'MyOrganizationsCtrl'
                })

                // PLAN OVERVIEW PAGE AND NESTED VIEWS ====================================
                .state('root.plan', {
                    url: '/org/:orgId/plan/:planId/:versionId',
                    templateUrl: 'views/plan.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
                        PlanVersion: 'PlanVersion',
                        planData: function (PlanVersion, organizationId, planId, versionId) {
                            return PlanVersion.get(
                                {orgId: organizationId, planId: planId, versionId: versionId}).$promise;
                        },
                        planVersions: function (PlanVersion, organizationId, planId) {
                            return PlanVersion.query({orgId: organizationId, planId: planId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        planId: function ($stateParams) {
                            return $stateParams.planId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        }
                    },
                    controller: 'PlanCtrl'
                })
                // Policies Tab
                .state('root.plan.policies', {
                    url: '/policies',
                    templateUrl: 'views/partials/plan/policies.html',
                    resolve: {
                        policyService: 'policyService',
                        policyData: function (policyService, organizationId, planId, versionId) {
                            return policyService.getPlanPoliciesWithDetails(organizationId, planId, versionId);
                        }
                    },
                    data: {
                        type: 'plan'
                    },
                    controller: 'PlanPoliciesCtrl'
                })
                // Activity Tab
                .state('root.plan.activity', {
                    url: '/activity',
                    templateUrl: 'views/partials/plan/activity.html',
                    resolve: {
                        PlanVersionActivity: 'PlanVersionActivity',
                        activityData: function (PlanVersionActivity, organizationId, planId, versionId) {
                            return PlanVersionActivity.get(
                                {orgId: organizationId, planId: planId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'PlanActivityCtrl'
                })

                // APPLICATION OVERVIEW PAGE AND NESTED VIEWS =====================================
                .state('root.application', {
                    url: '/org/:orgId/application/:appId/:versionId',
                    templateUrl: 'views/application.html',
                    resolve: {
                        Organization: 'Organization',
                        orgData: function (Organization, organizationId) {
                            return Organization.get({id: organizationId}).$promise;
                        },
                        ApplicationVersion: 'ApplicationVersion',
                        appData: function (ApplicationVersion, organizationId, applicationId, versionId) {
                            return ApplicationVersion.get({
                                orgId: organizationId,
                                appId: applicationId,
                                versionId: versionId
                            }).$promise;
                        },
                        appVersions: function (ApplicationVersion, organizationId, applicationId) {
                            return ApplicationVersion.query({orgId: organizationId, appId: applicationId}).$promise;
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        applicationId: function ($stateParams) {
                            return $stateParams.appId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        },
                        ApplicationContract: 'ApplicationContract',
                        contractData: function (ApplicationContract, organizationId, applicationId, versionId) {
                            return ApplicationContract.query({
                                orgId: organizationId,
                                appId: applicationId,
                                versionId: versionId
                            }).$promise;
                        },
                        Gateways : 'Gateways',
                        gateways: function (Gateways) {
                            return Gateways.query().$promise;
                        }
                    },
                    controller: 'ApplicationCtrl'
                })
                // Overview Tab
                .state('root.application.overview', {
                    url: '/overview',
                    templateUrl: 'views/partials/application/overview.html',
                    controller: 'OverviewCtrl'
                })
                // Contracts Tab
                .state('root.application.contracts', {
                    url: '/contracts',
                    templateUrl: 'views/partials/application/contracts.html',
                    controller: 'ContractsCtrl'
                })
                // APIs Tab
                .state('root.application.apis', {
                    url: '/apis',
                    templateUrl: 'views/partials/application/apis.html',
                    controller: 'ApisCtrl'
                })
                .state('root.application.security', {
                    url: '/security',
                    templateUrl: 'views/partials/application/security.html',
                    resolve: {
                        appService: 'appService',
                        tokens: function (appService, organizationId, applicationId, versionId) {
                            return appService.getAppVersionTokens(organizationId, applicationId, versionId);
                        }
                    },
                    controller: 'AppSecurityCtrl'
                })
                // Activity Tab
                .state('root.application.activity', {
                    url: '/activity',
                    templateUrl: 'views/partials/application/activity.html',
                    resolve: {
                        ApplicationVersionActivity: 'ApplicationVersionActivity',
                        activityData: function (ApplicationVersionActivity, organizationId, applicationId, versionId) {
                            return ApplicationVersionActivity.get(
                                {orgId: organizationId, appId: applicationId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ActivityCtrl'
                })
                // Metrics Tab
                .state('root.application.metrics', {
                    url: '/metrics',
                    templateUrl: 'views/partials/application/metrics.html',
                    controller: 'AppMetricsCtrl'
                })

                // SERVICE OVERVIEW PAGE AND NESTED VIEWS ====================================
                .state('root.service', {
                    url: '/org/:orgId/service/:svcId/:versionId',
                    templateUrl: 'views/service.html',
                    resolve: {
                        orgService: 'orgService',
                        orgData: function (orgService, organizationId) {
                            return orgService.orgInfo(organizationId);
                        },
                        service: 'service',
                        svcData: function (service, organizationId, serviceId, versionId) {
                            return service.getVersion(organizationId, serviceId, versionId);
                        },
                        endpoint: function (service, organizationId, serviceId, versionId) {
                            return service.getEndpoint(organizationId, serviceId, versionId);
                        },
                        svcVersions: function (service, organizationId, serviceId) {
                            return service.getServiceVersions(organizationId, serviceId);
                        },
                        organizationId: function ($stateParams) {
                            return $stateParams.orgId;
                        },
                        serviceId: function ($stateParams) {
                            return $stateParams.svcId;
                        },
                        versionId: function ($stateParams) {
                            return $stateParams.versionId;
                        },
                        ServiceSupportTickets: 'ServiceSupportTickets',
                        support: function (ServiceSupportTickets, organizationId, serviceId) {
                            return ServiceSupportTickets.query({orgId: organizationId, svcId: serviceId}).$promise;
                        }
                    },
                    controller: 'ServiceCtrl'
                })
                // Overview Tab
                .state('root.service.overview', {
                    url: '/overview',
                    templateUrl: 'views/partials/service/overview.html',
                    resolve: {
                        ServiceVersionContracts: 'ServiceVersionContracts',
                        svcContracts: function (ServiceVersionContracts, organizationId, serviceId, versionId) {
                            return ServiceVersionContracts.query(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceOverviewCtrl'
                })
                // Pending Contracts Tab
                .state('root.service.pending', {
                    url: '/pending',
                    templateUrl: 'views/partials/service/pending.html',
                    controller: 'ServicePendingContractsCtrl'
                })
                // Implementation Tab
                .state('root.service.implementation', {
                    url: '/implementation',
                    templateUrl: 'views/partials/service/implementation.html',
                    resolve: {
                        ServiceVersion: 'ServiceVersion',
                        svcData: function (ServiceVersion, organizationId, serviceId, versionId) {
                            return ServiceVersion.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceImplementationCtrl'
                })
                // Definition Tab
                .state('root.service.definition', {
                    url: '/definition',
                    templateUrl: 'views/partials/service/definition.html',
                    resolve: {
                        ServiceEndpoint: 'ServiceEndpoint',
                        endpoint: function (ServiceEndpoint, organizationId, serviceId, versionId) {
                            return ServiceEndpoint.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceDefinitionCtrl'
                })
                // Plans Tab
                .state('root.service.plans', {
                    url: '/plans',
                    templateUrl: 'views/partials/service/plans.html',
                    resolve: {
                        Plan: 'Plan',
                        planData: function (Plan, organizationId) {
                            return Plan.query({orgId: organizationId}).$promise;
                        }
                    },
                    controller: 'ServicePlansCtrl'
                })
                // Scope Tab
                .state('root.service.scopes', {
                    url: '/scopes',
                    templateUrl: 'views/partials/service/scopes.html',
                    resolve: {
                        AvailableMkts: 'AvailableMkts',
                        marketplaces: function (AvailableMkts) {
                            return AvailableMkts.get().$promise;
                        }
                    },
                    controller: 'ServiceScopeCtrl'
                })
                // Policies Tab
                .state('root.service.policies', {
                    url: '/policies',
                    templateUrl: 'views/partials/service/policies.html',
                    resolve: {
                        policyService: 'policyService',
                        policyData: function (policyService, organizationId, serviceId, versionId) {
                            return policyService.getServicePoliciesWithDetails(organizationId, serviceId, versionId);
                        }
                    },
                    data: {
                        type: 'service'
                    },
                    controller: 'ServicePoliciesCtrl'
                })
                // Terms Tab
                .state('root.service.terms', {
                    url: '/terms',
                    templateUrl: 'views/partials/service/terms.html',
                    controller: 'ServiceTermsCtrl'
                })
                // Readme Tab
                .state('root.service.readme', {
                    url: '/readme',
                    templateUrl: 'views/partials/service/readme.html',
                    controller: 'ServiceReadmeCtrl'
                })
                // Announcements Tab
                .state('root.service.announcements', {
                    url: '/announcements',
                    templateUrl: 'views/partials/service/announcements.html',
                    resolve: {
                        ServiceAnnouncementsAll: 'ServiceAnnouncementsAll',
                        announcements: function (ServiceAnnouncementsAll, organizationId, serviceId) {
                            return ServiceAnnouncementsAll.query({orgId: organizationId, svcId: serviceId}).$promise;
                        }
                    },
                    controller: 'ServiceAnnouncementsCtrl'
                })
                // Support Tab
                .state('root.service.support', {
                    url: '/support',
                    templateUrl: 'views/partials/service/support.html',
                    resolve: {
                    },
                    controller: 'ServiceSupportCtrl'
                })
                // Activity Tab
                .state('root.service.activity', {
                    url: '/activity',
                    templateUrl: 'views/partials/service/activity.html',
                    resolve: {
                        ServiceVersionActivity: 'ServiceVersionActivity',
                        activityData: function (ServiceVersionActivity, organizationId, serviceId, versionId) {
                            return ServiceVersionActivity.get(
                                {orgId: organizationId, svcId: serviceId, versionId: versionId}).$promise;
                        }
                    },
                    controller: 'ServiceActivityCtrl'
                })
                // Metrics Tab
                .state('root.service.metrics', {
                    url: '/metrics',
                    templateUrl: 'views/partials/service/metrics.html',
                    controller: 'ServiceMetricsController'
                })

                // USER PROFILE AND SETTINGS PAGE AND NESTED VIEWS ================================
                .state('root.user', {
                    url: '/user',
                    templateUrl: 'views/user.html',
                    controller: 'UserCtrl'
                })
                // Email Tab
                .state('root.user.email', {
                    url: '/email',
                    templateUrl: 'views/partials/user/email.html',
                    controller: 'UserEmailCtrl'
                })
                // Notifications Tab
                .state('root.user.notifications', {
                    url: '/notifications',
                    templateUrl: 'views/partials/user/notifications.html',
                    controller: 'UserNotificationsCtrl'
                })
                // Profile Tab
                .state('root.user.profile', {
                    url: '/profile',
                    templateUrl: 'views/partials/user/profile.html',
                    controller: 'UserProfileCtrl'
                })
                .state('root.user.security', {
                    url: '/connected',
                    templateUrl: 'views/partials/user/security.html',
                    resolve: {
                        currentUser: 'currentUser',
                        userGrants: function (currentUser) {
                            return currentUser.getUserGrants();
                        }
                    },
                    controller: 'UserSecurityCtrl'
                });
        })

        // Define Force Reload
        .config(function ($provide) {
            $provide.decorator('$state', function ($delegate, $stateParams) {
                $delegate.forceReload = function () {
                    return $delegate.go($delegate.current, $stateParams, {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                };
                return $delegate;
            });
        });
}());
