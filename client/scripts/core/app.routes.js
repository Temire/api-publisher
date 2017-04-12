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
