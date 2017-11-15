(function () {
    'use strict';

    let module = angular.module('app', [
        /* Angular modules */
        'ngAnimate',
        'ngResource',
        'ngSanitize',
        'ngAria',
        'ngMaterial',
        'uiSwitch',

        /* 3rd party modules */
        'ui.router',
        'ngStorage',
        'ui.bootstrap',
        'angular-loading-bar',
        'matchMedia',
        'ngTagsInput',
        'schemaForm',
        'angular-clipboard',
        'flow',
        'gridshore.c3js.chart',
        'textAngular',
        'relativeDate',
        'angular-jwt',
        'angular-ladda',
        'btford.markdown',
        'swaggerUi',
        'smart-table',
        'ngFileSaver',

        /* custom modules */
        'app.ctrls',
        'app.config',
        'app.constants',
        'app.directives',
        'app.services',
        'app.filters',
        'app.apiEngine',
        'app.core.login',
        'app.core.keycloak',
        'app.core.routes',
        'app.core.util',
        'app.ctrl.auth.oauth',
        'app.ctrl.modals',
        'app.ctrl.modals.lifecycle',
        'app.ctrl.modals.support',
        'app.administration',
        'app.branding',
        'app.contracts',
        'app.members',
        'app.notifications',
        'app.organizations',
        'app.plan',
        'app.plugin.lodash',
        'app.policies',
        'app.service',
        'app.swagger',
        'app.ui',
        'app.user'

    ]);

    // disable spinner in loading-bar
    module.config(function (cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
            cfpLoadingBarProvider.latencyThreshold = 100;
    });

        // ngStorage key config
    module.config(function ($localStorageProvider, CONFIG) {
            $localStorageProvider.setKeyPrefix(CONFIG.STORAGE.LOCAL_STORAGE);
        });
    module.config(function ($sessionStorageProvider, CONFIG) {
            $sessionStorageProvider.setKeyPrefix(CONFIG.STORAGE.SESSION_STORAGE);
        });

    module.run(function($state, $rootScope, kcHelper, loginHelper, CONFIG) {
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
                if (!loginHelper.checkLoggedIn()) {
                    if (loginHelper.checkLoginError()) {
                        event.preventDefault();
                    }
                    else if (loginHelper.checkLoginRequiredForState(toState)) {
                        event.preventDefault();
                        kcHelper.redirectToLogin();
                    }
                }
            });

            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                event.preventDefault();
                if (angular.isObject(error)) {
                    switch (error.status) {
                        case 401: // Unauthorized
                            console.log('Unauthorized');
                            if (!loginHelper.checkLoginError()) {
                                console.log('stateChangeError redirect');
                                kcHelper.redirectToLogin();
                            }
                            break;
                        default:
                            $state.get('root.error').error = error;
                            $state.go('root.error');
                            break;
                    }
                }
                else {
                    // unexpected error
                    $state.go('root.error');
                }
            });
        });

    module.config(function ($provide) {
            $provide.decorator('$exceptionHandler', extendExceptionHandler);

            function extendExceptionHandler($delegate) {
                return function(exception, cause) {
                    var errorData = {
                        exception: exception,
                        cause: cause
                    };
                    // TODO custom error handling
                    // console.log(errorData);
                    $delegate(exception, cause);
                };
            }
        });

    module.factory('httpErrorInterceptor', function ($q, $rootScope, EVENTS, _) {
            return {
                response: function (response) {
                    return response;
                },
                responseError: function (response) {
                    // TODO expand HTTP error handler
                    if (!_.isEmpty(response) && response.status === 503) {
                        if (!_.isEmpty(response.data) && response.data.errorCode === 20001) {
                            $rootScope.$broadcast(EVENTS.MAINTENANCE_MODE_ERROR, { code: response.data.errorCode, msg: response.data.message });
                        }
                    }
                    return $q.reject(response);
                }
            };
        });

    module.config(function ($httpProvider) {
        // Http interceptor to handle session timeouts and basic errors
        $httpProvider.interceptors.push('httpErrorInterceptor');
        $httpProvider.interceptors.push('authInterceptor');
    });

    let auth = {};

    angular.element(document).ready(function () {
        let keycloakAuth = new Keycloak('../keycloak.json');
        auth.loggedIn = false;
        keycloakAuth.init({ onLoad: 'check-sso'}).success(function () {
                auth.loggedIn = true;
                auth.authz = keycloakAuth;
                angular.bootstrap(document, ["app"]);
        });
    });

    module.service('Auth', function ($q) {
        this.checkToken = checkToken;
        let checkInProgress;

        function checkToken() {
            if (!checkInProgress) {
                checkInProgress = $q.defer();
                auth.authz.updateToken(60).success((refreshed) => {
                    checkInProgress.resolve(getGwToken(refreshed));
                }).error(function() {
                    checkInProgress.reject('error refreshing/retrieving token');
                });
            }
            return checkInProgress.promise.finally(() => {
                checkInProgress = undefined;
            });
        }

        function getGwToken(tokenRefreshed) {
            if (tokenRefreshed) {
                return exchangeToken(auth.authz.token).then(() => {
                    return auth.gwToken;
                });
            } else {
                // make sure we have a GW token
                if (auth.gwToken) {
                    // token is available and valid, return it
                    return auth.gwToken;
                } else {
                    // gwToken not set, exchange current KeyCloak token for gwToken
                    return exchangeToken(auth.authz.token).then(() => {
                        return auth.gwToken;
                    });
                }
            }
        }

        function exchangeToken(kcToken) {
            // Sending and receiving data in JSON format using POST method
            // Need to use XHR because $http causes circular dependency
            let deferred = $q.defer();
            let xhr = new XMLHttpRequest();
            const url = "/token";
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    auth.gwToken = JSON.parse(xhr.responseText);
                    deferred.resolve(auth.gwToken);
                }
            };
            const data = JSON.stringify({ "kcToken": kcToken });
            xhr.send(data);

            return deferred.promise;
        }
    });

    // Keycloak interceptor will be used for all requests
    module.factory('authInterceptor', function ($q, Auth, kcHelper, _) {
        return {
            request: function (config) {
                let deferred = $q.defer();
                if (_.startsWith(config.url, 'proxy/')) {
                    Auth.checkToken().then(token => {
                        config.headers = config.headers || {};
                        config.headers['Authorization'] = 'Bearer ' + token;
                        deferred.resolve(config);
                    }, () => {
                        deferred.reject('Failed to retrieve token');
                        kcHelper.redirectToLogin();
                    });
                } else {
                    deferred.resolve(config);
                }
                return deferred.promise;
            }
        };
    });

}());
