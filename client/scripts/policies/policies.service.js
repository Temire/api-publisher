(function () {
    'use strict';

    angular.module('app.policies')
        .service('policyService', policyService);


    function policyService($q, $sce, MktServiceVersionPolicy, PlanVersionPolicy, ServiceVersionPolicy, PolicyDefs, CONFIG, POLICIES, _) {
        this.generateDetailsPopover = generateDetailsPopover;
        // this.getPlanPoliciesWithDetailsForMarket = getPlanPoliciesWithDetailsForMarket;
        this.getPlanPoliciesWithDetails = getPlanPoliciesWithDetails;
        this.getServicePoliciesWithDetailsForMarket = getServicePoliciesWithDetailsForMarket;
        this.getServicePoliciesWithDetails = getServicePoliciesWithDetails;
        this.getServicePolicyDetails = getServicePolicyDetails;
        this.getPolicyDefinition = getPolicyDefinition;
        this.getPolicyDescription = getPolicyDescription;
        this.getPolicyIcon = getPolicyIcon;
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

        function generateDetailsPopover(definitionId, configuration) {
            var parsedConfiguration = angular.fromJson(configuration);
            switch (definitionId) {
                case POLICIES.ACL:
                    return generateAclPopover(parsedConfiguration);
                case POLICIES.GALILEO:
                    return generateGalileoPopover(parsedConfiguration);
                case POLICIES.RATE_LIMIT:
                    return generateRateLimitPopover(parsedConfiguration);
                case POLICIES.KEY_AUTH:
                    return generateKeyAuthPopover(parsedConfiguration);
                case POLICIES.JWT:
                    return generateJWTPopover(parsedConfiguration);
                case POLICIES.JWTUp:
                    return generateJWTUpPopover(parsedConfiguration);
                case POLICIES.CORS:
                    return generateCORSPopover(parsedConfiguration);
                case POLICIES.REQ_SIZE_LIMIT:
                    return generateRequestSizeLimitPopover(parsedConfiguration);
                case POLICIES.HTTP_LOG:
                    return generateHttpLogPopover(parsedConfiguration);
                case POLICIES.UDP_LOG:
                    return generateUDPLogPopover(parsedConfiguration);
                case POLICIES.TCP_LOG:
                    return generateTCPLogPopover(parsedConfiguration);
                case POLICIES.IP_RESTRICT:
                    return generateIPRestrictionPopover(parsedConfiguration);
                case POLICIES.OAUTH2:
                    return generateOAuthPopover(parsedConfiguration);
                case POLICIES.REQ_TRANSFORM:
                    return generateRequestTransformPopover(parsedConfiguration);
                case POLICIES.RES_TRANSFORM:
                    return generateResponseTransformPopover(parsedConfiguration);
                case POLICIES.HAL:
                    return generateHALPopover(parsedConfiguration);
                case POLICIES.JSON_THREAT_PROTECTION:
                    return generateJsonThreatProtectionPopover(parsedConfiguration);
                case POLICIES.LDAP:
                    return generateLDAPPopover(parsedConfiguration);
            }


            function generateAclPopover(config) {
                // Does not have config at the moment
            }

            function generateGalileoPopover(config) {
                return '<span class="text-light">Service token: <b>' + config.service_token + '</b>.</span>';
            }

            function generateRateLimitPopover(config) {
                var string = '<span class="text-light">Requests to this service are limited to:</span><ul class="text-light">';
                _.forEach(config, function (value, key) {
                    if (value) {
                        string += '<li>' + value + ' per ' + key + '</li>';
                    }
                });
                string += '</ul>';
                return string;
            }

            function generateKeyAuthPopover(config) {
                var string = '<span class="text-light">Key can be sent in one of the following fields:</span><ul class="text-light">';
                _.forEach(config.key_names, function (name) {
                    string += '<li>' + name + '</li>';
                });
                string += '</ul>';
                if (config.hide_credentials) string += '<p class="text-light small">Credentials will be hidden from the upstream service.</p>';
                else string += '<p class="text-light">Credentials will <b>not</b> be hidden from the upstream service.</p>';

                return string;
            }

            function generateJWTPopover(config) {
                var string = '<span class="text-light">Claims that will be verified:</span><ul class="text-light">';
                _.forEach(config.claims_to_verify, function (claim) {
                    string += '<li>' + claim + '</li>';
                });
                string += '</ul>';

                return string;
            }

            function generateJWTUpPopover(config) {
                var string = '<span class="text-light">JWT RS256 signed to upstream API.</span><ul class="text-light">';
                return string;
            }

            function generateCORSPopover(config) {
                var string = '';

                if (!_.isEmpty(config.methods)) {
                    string += '<p class="text-light">Allowed Methods: </p><ul class="text-light">';
                    _.forEach(config.methods, function (method) {
                        string += '<li>' + method + '</li>';
                    });
                } else {
                    string += '<p class="text-light">Allowed Methods: <span class="text-bold">All</span></p>';
                }

                string += '</ul>';

                if (!_.isEmpty(config.origin)) string += '<p class="text-light">Allowed Origin: <span class="text-bold">' + config.origin +  '</span></p>';

                return string;
            }

            function generateRequestSizeLimitPopover(config) {
                return '<span class="text-light">Requests to this service cannot exceed ' + config.allowed_payload_size + 'MB in size.</span>';
            }

            function generateHttpLogPopover(config) {
                return '<p class="text-light">Logs are sent to <b>' + config.http_endpoint + '</b> via ' + config.method + '.</p><p class="text-light">Timeout is set to ' + config.timeout +'ms.</p>'
            }

            function generateUDPLogPopover(config) {
                return '<p class="text-light">Logs are sent to <b>' + config.host + ':' + config.port + '</b>.</p><p class="text-light">Timeout is set to ' + config.timeout +'ms.</p>'
            }

            function generateTCPLogPopover(config) {
                return '<p class="text-light">Logs are sent to <b>' + config.host + ':' + config.port + '</b>.</p><p class="text-light">Timeout is set to ' + config.timeout +'ms.</p>'
            }

            function generateIPRestrictionPopover(config) {
                let string = '';
                if (_.keys(config.blacklist).length > 0) {
                    string += '<p class="text-bold">Blacklisted IPs:</p>';
                    string += '<ul class="text-light">';
                    _.forEach(config.blacklist, function (value) {
                        string += '<li>' + value + '</li>';
                    });
                    string += '</ul>';
                }

                if (_.keys(config.whitelist).length > 0) {
                    string += '<p class="text-bold">Whitelisted IPs:</p>';
                    string += '<ul class="text-light">';
                    _.forEach(config.whitelist, function (value) {
                        string += '<li>' + value + '</li>';
                    });
                    string += '</ul>';
                }
                if (string.length > 0) return string;
                else return '<p class="text-light">No config found</p>';
            }

            function generateOAuthPopover(config) {
                var string = '<p class="text-bold">Enabled profiles:</p>';

                if (config.enable_authorization_code) string += '<p class="text-light"><i class="fa fa-check text-success"></i>&nbsp;Authorization Code</p>';
                else string += '<p class="text-light"><i class="fa fa-times text-danger"></i>&nbsp;Authorization Code</p>';

                if (config.enable_client_credentials) string += '<p class="text-light"><i class="fa fa-check text-success"></i>&nbsp;Client Credentials</p>';
                else string += '<p class="text-light"><i class="fa fa-times text-danger"></i>&nbsp;Client Credentials</p>';

                if (config.enable_implicit_grant) string += '<p class="text-light"><i class="fa fa-check text-success"></i>&nbsp;Implicit Grant</p>';
                else string += '<p class="text-light"><i class="fa fa-times text-danger"></i>&nbsp;Implicit Grant</p>';

                if (_.keys(config.scopes).length > 0) {
                    string += '<p class="text-bold">Scopes:</p><ul class="text-light">';
                    _.forEach(config.scopes, function (value) {
                        string += '<li>' + value.scope_desc + '</li>';
                    });
                    string += '</ul>';

                    if (config.mandatory_scope) string += '<p class="text-light">Scope is <strong>mandatory</strong>.</p>';
                    else string += '<p class="text-light">Scope is <strong>optional</strong>.</p>';
                }

                if (config.hide_credentials) string += '<p class="text-light">Credentials will be hidden from the upstream server.</p>';
                else string += '<p class="text-light">Credentials will be sent along to the upstream server.</p>';

                string += '<p class="text-light">Tokens will expire after ' + config.token_expiration + ' seconds.</p>';

                return string;
            }

            function generateRequestTransformPopover(config) {
                var string = '';
                if (_.keys(config.remove).length > 0) {
                    string += '<p class="text-bold">Removes</p>';
                    _.forEach(config.remove, function (value, key) {
                        string += '<span class="text-light">From ' + key + '</span><ul class="text-light">';
                        _.forEach(value, function (field) {
                            string += '<li>' + field + '</li>';
                        });
                        string += '</ul>';
                    });
                }

                if (_.keys(config.add).length > 0) {
                    string += '<p class="text-bold">Adds</p>';
                    _.forEach(config.add, function (value, key) {
                        string += '<span class="text-light">To ' + key + '</span><ul class="text-light">';
                        _.forEach(value, function (field) {
                            string += '<li>' + field + '</li>';
                        });
                        string += '</ul>';
                    });
                }
                return string;
            }

            function generateResponseTransformPopover(config) {
                var string = '';
                if (_.keys(config.remove).length > 0) {
                    string += '<p class="text-bold">Removes</p>';
                    _.forEach(config.remove, function (value, key) {
                        string += '<span class="text-light">From ' + key + '</span><ul class="text-light">';
                        _.forEach(value, function (field) {
                            string += '<li>' + field + '</li>';
                        });
                        string += '</ul>';
                    });
                }

                if (_.keys(config.add).length > 0) {
                    string += '<p class="text-bold">Adds</p>';
                    _.forEach(config.add, function (value, key) {
                        string += '<span class="text-light">To ' + key + '</span><ul class="text-light">';
                        _.forEach(value, function (field) {
                            string += '<li>' + field + '</li>';
                        });
                        string += '</ul>';
                    });
                }
                return string;
            }

            function generateHALPopover(config) {
                return '<p class="text-light">HAL links to the service will be rewritten to have the gateway uri as their basepath.</p>';
                // Do nothing, no config is necessary for this plugin
            }

            function generateJsonThreatProtectionPopover(config) {
                var string = '<ul class="text-light">';
                string += '<li>Max. array element count: <b>' + config.array_element_count + '</b></li>';
                string += '<li>Max. container depth: <b>' + config.container_depth + '</b></li>';
                string += '<li>Max. object entry count: <b>' + config.object_entry_count + '</b></li>';
                string += '<li>Max. object entry name length: <b>' + config.object_entry_name_length + '</b></li>';
                string += '<li>Max. string value length: <b>' + config.object_entry_name_length + '</b></li>';
                string += '</ul>';
                if (config.source) string += '<p class="text-light">Only the <b>' + config.source + '</b> will be protected.</p>';
                return string;
            }

            function generateLDAPPopover(config) {
                let string = '';
                string += '<p class="text-light">LDAP host: <b>' + config.ldap_host + ':' + config.ldap_port + '</b></p>';
                string += '<ul class="text-light">';
                string += '<li>Base DN: ' + config.base_dn + '</li>';
                string += '<li>Attribute: ' + config.attribute + '</li>';
                string += '</ul>';

                if (config.hide_credentials) string += '<p class="text-light">Credentials will be hidden from the upstream server.</p>';
                else string += '<p class="text-light">Credentials will be sent along to the upstream server.</p>';

                if (config.verify_ldap_host) string += '<p class="text-light">LDAP host <b>will be verified</b>.</p>';
                else string += '<p class="text-light">LDAP host <b>will not be verified</b>.</p>';

                if (string.length > 0) return string;
                else return '<p class="text-light">No config found</p>';
            }

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
                        policy.popover = generateDetailsPopover(policy.policyDefinitionId, details.configuration);
                        policy.description = getPolicyDescription(policy.policyDefinitionId);
                        policy.iconPath = getPolicyIcon(policy.policyDefinitionId);
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
                        policy.popover = generateDetailsPopover(policy.policyDefinitionId, details.configuration);
                        policy.description = getPolicyDescription(policy.policyDefinitionId);
                        policy.iconPath = getPolicyIcon(policy.policyDefinitionId);
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
                        policy.popover = generateDetailsPopover(policy.policyDefinitionId, details.configuration);
                        policy.description = getPolicyDescription(policy.policyDefinitionId);
                        policy.iconPath = getPolicyIcon(policy.policyDefinitionId);
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

        function getPolicyDescription(policyDefinitionId) {
            switch (policyDefinitionId) {
                case POLICIES.ACL:
                    return 'Service has an Access Control List (ACL) that limits who can access it.';
                case POLICIES.OAUTH2:
                    return 'Service secured with OAuth2.0 authentication';
                case POLICIES.GALILEO:
                    return 'Analytics data is sent to Galileo';
                case POLICIES.RATE_LIMIT:
                    return 'Consumers can send a limited number of requests';
                case POLICIES.REQ_TRANSFORM:
                    return 'Incoming requests are transformed';
                case POLICIES.RES_TRANSFORM:
                    return 'Outgoing responses are transformed';
                case POLICIES.JWT:
                    return 'Service secured with JWT authentication';
                case POLICIES.JWTUp:
                    return 'Upstream API always receives signed JWT';
                case POLICIES.KEY_AUTH:
                    return 'Service secured with Key authentication';
                case POLICIES.CORS:
                    return 'Consumers can make requests from the browser';
                case POLICIES.IP_RESTRICT:
                    return 'Only certain IP addresses are allowed access to the service';
                case POLICIES.HTTP_LOG:
                    return 'Request and response logs are sent to a server via HTTP';
                case POLICIES.TCP_LOG:
                    return 'Request and response logs are sent to a server via TCP';
                case POLICIES.UDP_LOG:
                    return 'Request and response logs are sent to a server via UDP';
                case POLICIES.REQ_SIZE_LIMIT:
                    return 'Incoming requests cannot exceed a certain size';
                case POLICIES.LDAP:
                    return 'Authentication is integrated with an LDAP server';
                case POLICIES.JSON_THREAT_PROTECTION:
                    return 'Service is protected against JSON-based denial-of-service attacks';
                case POLICIES.HAL:
                    return 'Rewrites the HAL documentation links for this Service to pass via the gateway';
            }
        }

        function getPolicyIcon(policyDefinitionId) {
            return 'images/policies/' + policyDefinitionId.toLowerCase() + '.png';
        }

        function isConfigurable(policyDefinitionId) {
            return !_.find(['ACL', 'HAL', 'JWT', 'JWTUp'], function (o) {
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
