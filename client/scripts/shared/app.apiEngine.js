;(function() {
    'use strict';

    angular.module('app.apiEngine', ['ngResource'])

           /// ########### ENDPOINT FACTORIES #####################

           /// ########### SPECIAL MARKETPLACE ENDPOINTS: NO JWT REQUIRED ########################

           .factory('MktSearchLatestServiceVersions', function ($resource, CONFIG) {
               return $resource('auth/search/services/versions/latest', {}, {
                   query: {
                       method: 'POST'
                   }
               });
           })
           .factory('MktSearchLatestPublishedSvcsInCategories', function ($resource, CONFIG) {
               return $resource('auth/search/services/versions/latest/categories', {}, {
                   query: {
                       method: 'POST', isArray: true
                   }
               });
           })
           .factory('MktPublishedCategories', function ($resource, CONFIG) {
               return $resource('auth/search/service/categories/published');
           })
           .factory('MktServiceSupportTickets', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/support/:supportId');
           })
           .factory('MktServiceAnnouncementsAll', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/announcement/all');
           })
           .factory('MktServiceAvailability', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/versions/:versionId/availability');
           })
           .factory('MktServicePolicies', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/versions/:versionId/plugins');
           })
           .factory('MktServicePlans', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/versions/:versionId/plans');
           })
           .factory('MktServiceVersionPolicy', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/versions/:versionId/policies/:policyId');
           })
           .factory('MktServiceEndpoint', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/versions/:versionId/endpoint');
           })
           .factory('MktServiceVersion', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/versions/:versionId');
           })
           .factory('MktServiceVersionDefinition', function ($resource, CONFIG) {
               return $resource('auth/organizations/:orgId/services/:svcId/versions/:versionId/definition');
           })

           /// ========== GATEWAYS ========================================================================================
           .factory('Gateways', function ($resource, CONFIG) {
               return $resource('proxy/gateways');
           })

           /// ========== ACTIONS =========================================================================================
           .factory('Action', function ($resource, CONFIG) {
               return $resource('proxy/actions');
           })

           .factory('SwaggerDocFetch', function ($resource, CONFIG) {
               return $resource('proxy/actions/swaggerdoc');
           })

           /// ========== ADMIN ===========================================================================================
           .factory('TermsAdmin', function ($resource, CONFIG) {
               return $resource('proxy/admin/defaults/terms', {}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })

           .factory('DefaultTerms', function ($resource, CONFIG) {
               return $resource('proxy/defaults/terms');
           })

           /// ========== BRANDING ========================================================================================
           .factory('Branding', function ($resource, CONFIG) {
               return $resource('proxy/brandings/services/:brandingId');
           })


           /// ========== CONTRACTS =======================================================================================
           .factory('RequestContract', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/contracts/request');
           })
           .factory('AcceptContract', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/contracts/accept')
           })
           .factory('RejectContract', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/contracts/reject')
           })
           .factory('OrgIncomingPendingContracts', function ($resource, CONFIG, NOTIFICATIONS) {
               return $resource('proxy/organizations/:orgId/notifications/incoming/' +
                                NOTIFICATIONS.ORG.CONTRACT_PENDING);
           })
           .factory('OrgOutgoingPendingContracts', function ($resource, CONFIG, NOTIFICATIONS) {
               return $resource('proxy/organizations/:orgId/notifications/outgoing/' +
                                NOTIFICATIONS.ORG.CONTRACT_PENDING);
           })
           .factory('CancelContractRequest', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/contracts/requests/cancel')
           })

           /// ========== MEMBERSHIP ==========================================================================
           .factory('MembershipRequests', function ($resource, CONFIG, NOTIFICATIONS) {
               return $resource('proxy/organizations/:orgId/notifications/incoming/' +
                                NOTIFICATIONS.USER.MEMBERSHIP_PENDING);
           })
           .factory('UserMembershipRequests', function ($resource, CONFIG, NOTIFICATIONS) {
               return $resource('proxy/currentuser/notifications/outgoing/' +
                                NOTIFICATIONS.USER.MEMBERSHIP_PENDING);
           })
           .factory('UserMembershipGranted', function ($resource, CONFIG, NOTIFICATIONS) {
               return $resource('proxy/currentuser/notifications/incoming/' +
                                NOTIFICATIONS.USER.MEMBERSHIP_GRANTED);
           })
           .factory('UserMembershipRejected', function ($resource, CONFIG, NOTIFICATIONS) {
               return $resource('proxy/currentuser/notifications/incoming/' +
                                NOTIFICATIONS.USER.MEMBERSHIP_REJECTED);
           })
           .factory('RejectRequest', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/membership-requests/:userId/reject');
           })
           .factory('CancelRequest', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/membership-requests/cancel');
           })

           /// ========== NOTIFICATIONS =====================================================================
           .factory('ContractRequests', function ($resource, CONFIG, NOTIFICATIONS) {
               return $resource('proxy/organizations/:orgId/notifications/incoming/' +
                                NOTIFICATIONS.ORG.CONTRACT_PENDING);
           })
           .factory('Notifications', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/notifications');
           })
           .factory('PendingNotifications', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/notifications/pending');
           })
           .factory('UserIncomingNotifications', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/notifications/incoming/:notificationId');
           })
           .factory('UserOutgoingNotifications', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/notifications/outgoing');
           })
           .factory('OrgIncomingNotifications', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/notifications/incoming/:notificationId');
           })
           .factory('OrgOutgoingNotifications', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/notifications/outgoing');
           })

           /// ========== ORGANIZATION =====================================================================

           .factory('Organization', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:id', {id: '@id'}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })
           .factory('OrganizationActivity', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:id/activity');
           })
           .factory('OrganizationOwnershipTransfer', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/transfer');
           })
           .factory('Plan', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/plans/:planId',
                   {orgId: '@organizationId', planId: '@id'}, {
                       update: {
                           method: 'PUT'
                       }
                   });
           })
           .factory('PlanActivity', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/plans/:planId/activity');
           })
           .factory('PlanVersion', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/plans/:planId/versions/:versionId');
           })
           .factory('PlanVersionActivity', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/plans/:planId/versions/:versionId/activity');
           })
           .factory('PlanVersionPolicy', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/plans/:planId/versions/:versionId/policies/:policyId', {}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })
           .factory('Member', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/members/:userId/:roleId', {}, {
                   update: {
                       method: 'PUT',
                       isArray: true
                   }
               });
           })
           .factory('Application', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId',
                   {orgId: '@organizationId', appId: '@id'},
                   {
                       update: {
                           method: 'PUT'
                       }
                   });
           })
           .factory('ApplicationVersion', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId',
                   {orgId: '@application.organisation.id', appId: '@application.id', versionId: '@id'});
           })
           .factory('ApplicationVersionToken', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/oauth2/tokens')
           })
           .factory('ApplicationOAuthCallback', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId');
           })
           .factory('ApplicationActivity', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/activity');
           })
           .factory('ApplicationVersionActivity', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/activity');
           })
           .factory('ApplicationContract', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/contracts/:contractId');
           })
           .factory('ApplicationMetrics', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/metrics/serviceUsage');
           })
           .factory('ApplicationApiRegistryJson', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
           })
           .factory('ApplicationApiRegistryXml', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/apiregistry/json');
           })
           .factory('ApplicationApiKeyReissue', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/key-auth/reissue', {}, {
                   request: {
                       method: 'POST'
                   }
               });
           })
           .factory('ApplicationOAuthReissue', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/applications/:appId/versions/:versionId/oauth2/reissue', {}, {
                   request: {
                       method: 'POST'
                   }
               });
           })
           .factory('Service', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId',
                   {orgId: '@organizationId', svcId: '@id'},
                   {
                       update: {
                           method: 'PUT'
                       }
                   });
           })
           .factory('ServiceActivity', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/activity');
           })
           .factory('ServiceTerms', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/terms', {}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })
           .factory('ServiceAnnouncements', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/announcement/:announcementId');
           })
           .factory('ServiceAnnouncementsAll', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/announcement/all');
           })
           .factory('ServiceBranding', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/brandings/:brandingId');
           })
           .factory('ServiceFollowers', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/followers');
           })
           .factory('ServiceFollowerAdd', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/followers/add/:userId');
           })
           .factory('ServiceFollowerRemove', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/followers/remove/:userId');
           })
           .factory('ServiceVersion', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId', {}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })
           .factory('ServiceVersionMarketInfo', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/marketinfo');
           })
           .factory('ServiceVersionDefinition', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/definition',
                   {}, {
                       update: {
                           method: 'PUT'
                       }
                   });
           })
           .factory('ServiceVersionPolicy', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/policies/:policyId', {}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })
           .factory('ServiceVersionActivity', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/activity');
           })
           .factory('ServiceVersionContracts', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/contracts');
           })
           .factory('ServiceVersionUpstream', function($resource) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/upstreams')
           })
           .factory('ServiceVersionUpstreamAdd', function($resource) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/upstreams/add')
           })
           .factory('ServiceVersionUpstreamRemove', function($resource) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/upstreams/remove')
           })
           .factory('ServiceEndpoint', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/endpoint');
           })
           .factory('ServicePlans', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/plans');
           })
           .factory('ServiceMkts', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/availability');
           })
           .factory('ServicePolicies', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/plugins');
           })
           .factory('ServiceVersionMetrics', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/metrics/usage');
           })
           .factory('ServiceMetricsResponse', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/metrics/responseStats');
           })
           .factory('ServiceMetricsResponseSummary', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/metrics/summaryResponseStats');
           })
           .factory('ServiceMarketInfo', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/versions/:versionId/market/info');
           })
           .factory('ServiceSupportTickets', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/services/:svcId/support/:supportId', {},
                   {
                       update: {
                           method: 'PUT'
                       }
                   });
           })
           .factory('ServiceTicketComments', function ($resource, CONFIG) {
               return $resource('proxy/organizations/services/support/:supportId/comments/:commentId' , {},
                   {
                       update: {
                           method: 'PUT'
                       }
                   });
           })
           .factory('ServiceOAuthAuthorize', function ($resource, CONFIG) {
               return $resource('proxy/oauth2/authorize');
           })
           .factory('ServiceOAuthToken', function ($resource, CONFIG) {
               return $resource('proxy/oauth2/token');
           })
           .factory('RequestMembership', function ($resource, CONFIG) {
               return $resource('proxy/organizations/:orgId/request-membership');
           })

           /// ========== CURRENTUSER ======================================================================

           .factory('CurrentUserInfo', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/info', {}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })
           .factory('CurrentUserApps', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/applications');
           })

           .factory('CurrentUserAppOrgs', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/apporgs');
           })

           .factory('CurrentUserPlanOrgs', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/planorgs');
           })

           .factory('CurrentUserServices', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/services');
           })

           .factory('CurrentUserSvcOrgs', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/svcorgs');
           })

           .factory('CurrentUserToken', function ($resource, CONFIG) {
               return $resource('proxy/currentuser/oauth2/tokens')
           })

           /// ========== USERS ============================================================================

           .factory('Users', function ($resource, CONFIG) {
               return $resource('proxy/users/:userId');
           })

           .factory('Admins', function ($resource, CONFIG){
               return $resource('proxy/users/admins');
           })

           .factory('AdminUser', function ($resource, CONFIG) {
               return $resource('proxy/users/admins/:id', {id: '@id'}, {
                   update: {
                       method: 'PUT'
                   }
               });
           })

           .factory('UserSearch', function ($resource, CONFIG) {
               return $resource('proxy/users/search');
           })
           /// ========== LOGIN/LOGOUT/TOKEN REFRESH =======================================================

           .factory('LogOutRedirect', function ($resource, CONFIG) {
               return $resource('auth/login/idp/logout');
           })
           .factory('UserSearch', function ($resource, CONFIG) {
               return $resource('auth/login/idp/user/name');
           })
           .factory('EmailSearch', function ($resource, CONFIG) {
               return $resource('auth/login/idp/user/mail');
           })

           /// ========== POLICYDEFS =======================================================================

           .factory('PolicyDefs', function ($resource, CONFIG) {
               return $resource('proxy/policyDefs/:policyId');
           })

           /// ========== ROLES ============================================================================
           .factory('Roles', function ($resource, CONFIG) {
               return $resource('proxy/roles/:roleId');
           })

           /// ========== SEARCH ===========================================================================

           .factory('SearchApps', function ($resource, CONFIG) {
               return $resource('proxy/search/applications');
           })
           .factory('Categories', function ($resource, CONFIG) {
               return $resource('proxy/search/service/categories/all');
           })
           .factory('PublishedCategories', function ($resource, CONFIG) {
               return $resource('auth/search/service/categories/published');
           })
           .factory('SearchOrgs', function ($resource, CONFIG) {
               return $resource('proxy/search/organizations');
           })
           .factory('SearchSvcs', function ($resource, CONFIG) {
               return $resource('auth/search/services', {}, {
                   query: {
                       method: 'POST'
                   }
               });
           })
           .factory('SearchPublishedSvcsInCategories', function ($resource, CONFIG) {
               return $resource('auth/search/services/versions', {}, {
                   query: {
                       method: 'POST', isArray: true
                   }
               });
           })
           .factory('SearchLatestPublishedSvcsInCategories', function ($resource, CONFIG) {
               return $resource('proxy/search/services/versions/latest/categories', {}, {
                   query: {
                       method: 'POST', isArray: true
                   }
               });
           })
           .factory('SearchSvcsWithStatus', function ($resource, CONFIG) {
               return $resource('auth/search/services/:status');
           })
           .factory('SearchLatestServiceVersions', function ($resource, CONFIG) {
               return $resource('proxy/search/services/versions/latest', {}, {
                   query: {
                       method: 'POST'
                   }
               });
           })

           /// ========== SYSTEM ============================================================================
           .factory('AvailableMkts', function ($resource, CONFIG) {
               return $resource('proxy/system/marketplaces');
           })
           .factory('BlacklistRecords', function ($resource, CONFIG) {
               return $resource('proxy/system/blacklist/records');
           })
           .factory('WhitelistRecords', function ($resource, CONFIG) {
               return $resource('proxy/system/whitelist/records');
           })
           .factory('StatusInfo', function ($resource, CONFIG) {
               return $resource('proxy/security/status');
           })
           .factory('SystemStatus', function ($resource, CONFIG) {
               return $resource('auth/system/status');
           })

           /// ========== OAUTH ============================================================================

           .factory('ApplicationOAuth', function ($resource, CONFIG) {
               return $resource(
                   'auth/oauth/application/:clientId/target/organization/:orgId/service/:svcId/version/:versionId');
           })
           .factory('OAuthConsumer', function ($resource, CONFIG) {
               return $resource(
                   'auth/oauth/consumer', {}, {
                       create: {
                           method: 'POST'
                       }
                   });
           })
           /// ========== SECURITY ============================================================================
           .factory('OAuthCentralExpTime', function ($resource, CONFIG) {
               return $resource('proxy/security/oauth/expiration-time');//post body with expirationTime (integer in seconds)
           })
           .factory('JWTCentralExpTime', function ($resource, CONFIG) {
               return $resource('proxy/security/jwt/expiration-time'); //post body with expirationTime (integer in seconds)
           })
           .factory('OAuthTokenRevoke', function ($resource, CONFIG) {
               return $resource('proxy/security/oauth2/tokens/revoke');
           })
           .factory('ReissueAllKeys', function ($resource, CONFIG) {
               return $resource('proxy/security/key-auth/reissue', {}, {
                   reissue: {
                       method: 'POST',
                       isArray: true
                   }
               });
           })
           .factory('ReissueAllCredentials', function ($resource, CONFIG) {
               return $resource('proxy/security/oauth2/reissue', {}, {
                   reissue: {
                       method: 'POST',
                       isArray: true
                   }
               });
           });
})();
