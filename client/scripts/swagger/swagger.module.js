(function () {
    'use strict';

    angular.module('app.swagger', ['swaggerUi'])
        .service('swaggerCurlGenerator', curlGenerator)
        .service('swaggerDefinitionStripper', definitionStripper)
        .service('swaggerRequestTagger', requestTagger)
        .run(function (swaggerModules, swaggerCurlGenerator, swaggerDefinitionStripper, swaggerRequestTagger) {
            swaggerModules.add(swaggerModules.BEFORE_PARSE, swaggerDefinitionStripper);
            swaggerModules.add(swaggerModules.BEFORE_EXPLORER_LOAD, swaggerRequestTagger);
            swaggerModules.add(swaggerModules.AFTER_EXPLORER_LOAD, swaggerCurlGenerator);
        });
    

    function curlGenerator($q) {
        /**
         * Module entry point
         */
        this.execute = function(options) {
            var deferred = $q.defer();
            deferred.resolve(true);
            return deferred.promise;
        };
    }    
    
    function definitionStripper($q) {
        /**
         * Module entry point
         */
        this.execute = function(url, swagger) {
            var deferred = $q.defer();

            // Remove all path properties that start with "X-"
            Object.keys(swagger.paths).forEach(function (path) {
                Object.keys(swagger.paths[path]).forEach(function (pathKey) {
                    if (pathKey.substr(0, 2) == 'x-') {
                        delete swagger.paths[path][pathKey];
                    }
                })
            });
            
            deferred.resolve(true);
            return deferred.promise;
        };
    }
    
    function requestTagger($q) {
        /**
         * Module entry point
         */
        this.execute = function(options) {
            var deferred = $q.defer();
            options.isSwaggerUIRequest = true;
            deferred.resolve(options);
            return deferred.promise;
        };
    }

})();