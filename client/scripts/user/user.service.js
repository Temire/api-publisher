(function () {
    'use strict';

    angular.module('app.user')
        .service('currentUser', currentUser)
        .service('currentUserModel', currentUserModel)
        .service('userService', userService);

    function currentUser($q, CurrentUserInfo, CurrentUserApps, ApplicationContract, ApplicationVersion,
                         CurrentUserAppOrgs, CurrentUserServices, CurrentUserSvcOrgs, CurrentUserToken, $http, _) {
        this.checkStatus = checkStatus;
        this.getInfo = getInfo;
        this.getUserAppOrgs = getUserAppOrgs;
        this.getUserApps = getUserApps;
        this.getUserSvcOrgs = getUserSvcOrgs;
        this.getUserServices = getUserServices;
        this.getUserGrants = getUserGrants;
        this.revokeUserGrants = revokeUserGrants;
        this.update = update;

        function checkStatus() {
            var status = { hasOrg: false, hasApp: false, hasContract: false };
            var deferred = $q.defer();

            getUserAppOrgs().then(function (orgs) {
                if (orgs.length > 0) {
                    status.hasOrg = true;
                    getUserApps().then(function (apps) {
                        if (apps.length > 0) {
                            status.hasApp = true;
                            checkAppsForContracts(apps).then(function (hasAppContract) {
                                status.hasContract = hasAppContract;
                                deferred.resolve(status);
                            })
                        } else {
                            deferred.resolve(status);
                        }
                    })
                } else {
                    deferred.resolve(status);
                }
            });
            return deferred.promise;
        }

        function checkAppsForContracts(userApps) {
            // Should check all apps *sequentially!* until we encounter a contract or apps are exhausted
            var hasContract = $q.defer();
            var chain = $q.when();
            _.forEach(userApps, function (app) {
                chain = chain.then(getVersions(app));
            });
            chain.then(function () {
                // chain resolved successfully ==> none of the apps have a contract for any version
                hasContract.resolve(false);
            }, function () {
                // chain was rejected before reaching the end ==> at least one of the app versions has a contract
                hasContract.resolve(true);
            });

            function getVersions(app) {
                return function() {
                    var versionsDeferred = $q.defer();
                    ApplicationVersion.query({ orgId: app.organizationId, appId: app.id }).$promise.then(function (versions) {
                        var versionChain = $q.when();
                        _.forEach(versions, function (appVersion) {
                            versionChain = versionChain.then(getContracts(appVersion));
                        });
                        versionChain.then(function () {
                            // versionChain resolved successfully ==> no contracts found for this version
                            versionsDeferred.resolve();
                        }, function () {
                            // versionChain was rejected ==> a contract was found!
                            versionsDeferred.reject('has contract');
                        })
                    });
                    return versionsDeferred.promise;
                }
            }

            function getContracts(version) {
                return function () {
                    var contractDeferred = $q.defer();
                    ApplicationContract.query({ orgId: version.organizationId, appId: version.id, versionId: version.version }).$promise.then(function (contracts) {
                        if (_.isEmpty(contracts)) contractDeferred.resolve();
                        else contractDeferred.reject('has contract');
                    });
                    return contractDeferred.promise;
                }
            }

            return hasContract.promise;
        }

        function getInfo() {
            return CurrentUserInfo.get().$promise;
        }

        function getUserAppOrgs() {
            return CurrentUserAppOrgs.query().$promise;
        }

        function getUserApps() {
            return CurrentUserApps.query().$promise;
        }

        function getUserSvcOrgs() {
            return CurrentUserSvcOrgs.query().$promise;
        }

        function getUserServices() {
            return CurrentUserServices.query().$promise;
        }

        function update(newUserInfo) {
            return CurrentUserInfo.update({}, newUserInfo).$promise;
        }

        function getUserGrants() {
            return CurrentUserToken.get().$promise.then(function (results) {
                var promises = [];
                var grants = [];
                _.forEach(results.data, function (token) {
                    var grant = {};
                    grant.originalToken = angular.copy(token);
                    var scopesArray = [];
                    _.forEach(_.split(token.scope, ' '), function (scopeString) {
                        scopesArray.push(_.split(scopeString, '.')[3]);
                    });
                    scopesArray = _.sortBy(scopesArray);
                    grant.scopesString = _.join(scopesArray, ', ');
                    grants.push(grant);
                });
                return $q.all(promises).then(function () {
                    return grants;
                });
            });
        }

        function revokeUserGrants(grants) {
            var promises = [];
            _.forEach(grants, function (grant) {
                promises.push($http({
                    method: 'DELETE',
                    url: 'proxy/currentuser/oauth2/tokens',
                    data: grant,
                    headers: {'Content-Type': 'application/json;charset=utf-8'}
                }));
            });

            return $q.all(promises);
        }
    }

    function currentUserModel(orgScreenModel, CurrentUserInfo) {
        var permissionTree = [];
        this.currentUser = {};

        this.isAuthorizedFor = isAuthorizedFor;
        this.isAuthorizedForAny = isAuthorizedForAny;
        this.isAuthorizedForIn = isAuthorizedForIn;
        this.refreshCurrentUserInfo = refreshCurrentUserInfo;

        function refreshCurrentUserInfo(currentUserModel) {
            return CurrentUserInfo.get({}, function (userInfo) {
                currentUserModel.currentUser = userInfo;
                createPermissionsTree(userInfo.permissions);
            }).$promise;
        }

        function createPermissionsTree(permissions) {
            permissionTree = [];
            angular.forEach(permissions, function (value) {
                if (!permissionTree[value.organizationId]) {
                    permissionTree[value.organizationId] = [];
                }
                permissionTree[value.organizationId].push(value.name);
            });
        }

        function isAuthorizedFor(permission) {
            if (permissionTree[orgScreenModel.organization.id]) return permissionTree[orgScreenModel.organization.id].indexOf(permission) !== -1;
            else return false;
        }

        function isAuthorizedForAny(permissions) {
            for (var i = 0; i < permissions.length; i++) {
                if (isAuthorizedFor(permissions[i])) {
                    return true;
                }
            }
            return false;
        }

        function isAuthorizedForIn(permission, orgId) {
            if (permissionTree[orgId]) return permissionTree[orgId].indexOf(permission) !== -1;
            else return false;
        }
    }

    function userService(Users) {
        this.getUserDetails = getUserDetails;

        function getUserDetails(userId) {
            return Users.get({ userId: userId }).$promise;
        }
    }

})();
