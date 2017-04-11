(function () {
    'use strict';

    angular.module('app.core.login', [])
        .service('loginHelper', loginHelper);


    function loginHelper($localStorage, $sessionStorage, $location, $state, $window, resourceUtil, CONFIG, errorHelper, Auth, _) {
        this.checkIsFirstVisit = checkIsFirstVisit;
        this.checkLoginError = checkLoginError;
        this.checkLoggedIn = checkLoggedIn;
        this.checkLoginRequiredForState = checkLoginRequiredForState;
        this.checkJWTInSession = checkJWTInSession;
        this.isTransitioningToError = isTransitioningToError;
        this.redirectToLogin = redirectToLogin;

        let transitionToError = false;
        let LOGIN_ERROR_CODE = '20002';

        function isTransitioningToError() {
            return transitionToError;
        }

        function checkIsFirstVisit() {
            return !!$localStorage.hasVisited;
        }

        function checkLoginError() {
            if (checkErrorInUrl()) {
                let error = $location.search().errorcode;
                let msg = $location.search().errormessage;
                if (error === LOGIN_ERROR_CODE) {
                    transitionToError = true;
                    $state.get('root.maintenance').error = angular.copy(msg);
                    $state.go('root.maintenance').then(function () {
                        transitionToError = false;
                    });
                }
                $location.search('errormessage', null);
                $location.search('errorcode', null);
                return true;
            }
            return false;
        }

        function checkLoggedIn() {
            return checkJWTInSession();
        }

        function checkJWTInSession() {
            return !_.isEmpty(Auth.authz.token);
        }

        function checkErrorInUrl() {
            return !_.isEmpty($location.search().errorcode);
        }

        function checkLoginRequiredForState(currentState) {
            switch (currentState.name) {
                case '':
                case 'accessdenied':
                case 'root.error':
                case 'root.maintenance':
                case 'oauth':
                case 'logout':
                case 'root.apis.grid':
                case 'root.apis.list':
                case 'root.api':
                case 'root.api.announcements':
                case 'root.api.documentation':
                case 'root.api.plans':
                case 'root.api.scopes':
                case 'root.api.support':
                case 'root.api.terms':
                case 'root.search':
                    return false;
                default:
                    return true;
            }
        }

        function redirectToLogin() {
            let keycloakAuth = new Keycloak('../keycloak.json');
            keycloakAuth.init({onLoad: 'login-required'}).success(function () {
                auth.loggedIn = true;
                console.log(angular.copy(keycloakAuth));
                auth.authz = keycloakAuth;
            }).error(function () {
                console.log('*** ERROR');
                window.location.reload();
            });
        }
    }

}());
