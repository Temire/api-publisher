;(function(angular) {
    'use strict';

    angular.module('app.config', [])
        .constant('CONFIG', {
            BASE: {
                URL:'https://dev.apim.t1t.be:8443/dev/apiengine/v1',
                JWT_HEADER_NAME: 'jwt'
            },
            AUTH: {
                URL: 'https://dev.apim.t1t.be:8443/dev/apiengineauth/v1'
            },
            STORAGE: {
                LOCAL_STORAGE: 'apim-',
                SESSION_STORAGE: 'apim_session-'
            },
            SECURITY: {
                REDIRECT_URL: '/login/idp/redirect',
                API_KEY: '6b8406cc81fe4ca3cc9cd4a0abfb97c2',
                IDP_URL: 'https://dev.idp.t1t.be:9443/samlsso',
                SP_URL: 'http://dev.api.t1t.be/API-Engine-auth/v1/login/idp/callback',
                SP_NAME: 'apimmarket',
                CLIENT_TOKEN: 'jwt'
            },
            KONG: {
                HOST: 'dev.apim.t1t.be:8443'
            }
        });

})(window.angular);
