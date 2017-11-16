/*
 * Orange angular-swagger-ui - v0.3.1
 *
 * (C) 2015 Orange, all right reserved
 * MIT Licensed
 */
'use strict';

angular
    .module('swaggerUi')
    .service('swaggerClient', function($q, $http, swaggerModules) {

        /**
         * format API explorer response before display
         */
        function formatResult(deferred, response) {
            var query = '',
                data = response.data,
                config = response.config;
            // angular needs the Content-Type header to be set to undefined to correctly POST a multipart/form-data
            // request, here we add it back in to be able to generate a correct curl command
            if (config.method === 'POST' && config.headers['Content-Type'] === undefined) config.headers['Content-Type'] = 'multipart/form-data';

            var curl = 'curl -X ' + config.method.toUpperCase();
            angular.forEach(config.headers, function (value, key) {
                curl += ' --header \'' + key + ': ' + value + '\''
            });

            if (config.data) {
                if (config.data instanceof FormData) {
                    if (config.headers['Content-Type'] === 'multipart/form-data') {
                        curl += ' -F \'';
                    } else {
                        curl += ' -d \'';
                    }
                    config.data.forEach(function (val, key) {
                        curl += '' + key + '=' + val + '&';
                    });
                    curl = curl.slice(0, - 1);
                    curl += '\'';
                } else {
                    curl += ' -d \'' + angular.toJson(angular.fromJson(config.data)) + '\'';
                }
            }

            if (config.params) {
                var parts = [];
                for (var key in config.params) {
                    parts.push(key + '=' + encodeURIComponent(config.params[key]));
                }
                if (parts.length > 0) {
                    query = '?' + parts.join('&');
                }
            }
            curl += ' \'' + config.url + query + '\'';

            deferred.resolve({
                url: config.url + query,
                curl: curl,
                response: {
                    body: data ? (angular.isString(data) ? data : angular.toJson(data, true)) : 'no content',
                    status: response.status,
                    headers: angular.toJson(response.headers(), true)
                }
            });
        }

        /**
         * Send API explorer request
         */
        this.send = function(swagger, operation, values, basePath, hasOAuth) {
            var deferred = $q.defer(),
                query = {},
                headers = {},
                path = operation.path,
                body;

            // build request parameters
            for (var i = 0, params = operation.parameters || [], l = params.length; i < l; i++) {
                //TODO manage 'collectionFormat' (csv etc.) !!
                var param = params[i],
                    value = values[param.name];

                switch (param.in) {
                    case 'query':
                        if (!!value) {
                            query[param.name] = value;
                        }
                        break;
                    case 'path':
                        path = path.replace('{' + param.name + '}', encodeURIComponent(value));
                        break;
                    case 'header':
                        if (!!value) {
                            headers[param.name] = value;
                        }
                        break;
                    case 'formData':
                        body = body || new FormData();
                        if (!!value) {
                            if (param.type === 'file') {
                                values.contentType = undefined; // make browser defining it by himself
                            }
                            body.append(param.name, value);
                        }
                        break;
                    case 'body':
                        body = body || value;
                        break;
                }
            }

            // add headers
            headers.Accept = values.responseType;
            headers['Content-Type'] = body ? values.contentType : 'text/plain';

            // add API key if present and we are not sending to an OAuth API
            if (operation.apikey && !hasOAuth) headers.apikey = operation.apikey;

            // add JWT if present
            if (operation.jwt && operation.jwt.trim() !== '') headers.Authorization = 'Bearer ' + operation.jwt;

            // add custom headers if present
            if (operation.customHeaders && operation.customHeaders.length > 0) {
                operation.customHeaders.forEach(function (customHeader) {
                    headers[customHeader.name] = customHeader.value;
                })
            }

            // build request

            // Ignore Swagger doc basepath, use scope path instead
            // var baseUrl = [
            // 		swagger.schemes[0],
            // 		'://',
            // 		swagger.host,
            // 		swagger.basePath || ''
            // 	].join(''),
            var	options = {
                    method: operation.httpMethod,
                    url: basePath + path,
                    headers: headers,
                    data: body,
                    params: query
                },
                callback = function(data, status, headers, config) {
                    // execute modules
                    var response = {
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    };
                    swaggerModules
                        .execute(swaggerModules.AFTER_EXPLORER_LOAD, response)
                        .then(function() {
                            formatResult(deferred, response);
                        });
                };

            // execute modules
            swaggerModules
                .execute(swaggerModules.BEFORE_EXPLORER_LOAD, options)
                .then(function() {
                    // check for multipart/form-data request
                    if (options.method === 'post' && options.headers['Content-Type'] === 'multipart/form-data') {
                        options.transformRequest = angular.identity;
                        options.headers['Content-Type'] = undefined;
                    }
                    // send request
                    $http(options)
                        .success(callback)
                        .error(callback);
                });

            return deferred.promise;
        };

    });
