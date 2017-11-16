;(function() {
    'use strict';

    angular.module('app.filters', [])

        .filter('excludeRole', function () {
            return function (roles, currentRole) {
                var out = [];
                angular.forEach(roles, function (role) {
                    if (role.id !== currentRole.roleId) {
                        out.push(role);
                    }
                });
                return out;
            };
        })

        .filter('joinBy', function () {
            return function (input, delimiter) {
                return (input || []).join(delimiter || ',');
            };
        })

        .filter('pricing', function () {
            return function(apis, currentPricingFilter) {
                var out = [];
                for (var i = 0; i < apis.length; i++) {
                    var api = apis[i];
                    if (currentPricingFilter.toLowerCase() === 'all') {
                        out.push(api);
                    } else {
                        if (currentPricingFilter.toLowerCase() === api.pricing.toLowerCase()) {
                            out.push(api);
                        }
                    }
                }
                return out;
            };
        })

        .filter('categories', function () {
            return function(apis, currentCategories) {
                if (currentCategories.length === 0) {
                    return apis;
                } else {
                    var out = [];
                    for (var i = 0; i < apis.length; i++) {
                        var api = apis[i];
                        for (var j = 0; j < api.tags.length; j++) {
                            var tag = api.tags[j];
                            if (currentCategories.indexOf(tag) > -1) {
                                out.push(api);
                                break;
                            }
                        }
                    }
                    return out;
                }
            };
        });

    // #end
})();
