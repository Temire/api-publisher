;(function(angular) {
  "use strict";


angular.module("app.ctrl.organization", [])

  /// ==== Organizations Overview & Search Controller
  .controller("OrganizationsCtrl", ["$scope", "Organization", "SearchOrgs", "CurrentUserAppOrgs", "CurrentUserSvcOrgs",
    function ($scope, Organization, SearchOrgs, CurrentUserAppOrgs, CurrentUserSvcOrgs) {

      var userOrgIds = null;

      $scope.isMember = function (org) {
        return userOrgIds.indexOf(org.id) > -1;
      };

      $scope.doSearch = function (searchString) {
        if (userOrgIds === null) {
          userOrgIds = [];
          if ($scope.publisherMode) {
            CurrentUserSvcOrgs.query({}, function (reply) {
              addOrgs(reply);
            });
          } else {
            CurrentUserAppOrgs.query({}, function (reply) {
              addOrgs(reply);
            });
          }

        }

        var addOrgs = function (reply) {
          angular.forEach(reply, function (org) {
            userOrgIds.push(org.id);
          });
        };

        var search = {};
        search.filters = [ { name: "name", value: searchString, operator: "like" }];
        search.orderBy = { ascending: true, name: "name"};
        search.paging = { page: 1, pageSize: 100};

        SearchOrgs.save(search, function (results) {
          $scope.totalOrgs = results.totalSize;
          $scope.orgs = results.beans;
        });
      };
    }])

  /// ==== MyOrganizations Overview Controller
  .controller("MyOrganizationsCtrl", ["$scope", "$modal", "appOrgData", "svcOrgData", "toastService", "headerModel",
    function ($scope, $modal, appOrgData, svcOrgData, toastService, headerModel) {

      headerModel.setIsButtonVisible(false, false);
      $scope.toasts = toastService.toasts;
      $scope.toastService = toastService;

      if ($scope.publisherMode) {
        $scope.orgs = svcOrgData;
      } else {
        $scope.orgs = appOrgData;
      }

      $scope.modalAnim = "default";

      $scope.modalNewOrganization = function() {
        $modal.open({
          templateUrl: "views/modals/modalNewOrganization.html",
          size: "lg",
          controller: "NewOrganizationCtrl as ctrl",
          resolve: function() {},
          windowClass: $scope.modalAnim	// Animation Class put here.
        });

      };

    }])


/// ==== Organization Controller
.controller("OrganizationCtrl", ["$scope", "$state", "$stateParams", "screenSize", "orgData", "toastService", "TOAST_TYPES", "Organization", "OrganizationMembers", "orgScreenModel",
  function ($scope, $state, $stateParams, screenSize, orgData, toastService, TOAST_TYPES, Organization, OrganizationMembers, orgScreenModel) {

    $scope.displayTab = orgScreenModel;
    orgScreenModel.updateOrganization(orgData);
    $scope.org = orgData;
    OrganizationMembers.query({orgId: $scope.org.id}, function (reply) {
      $scope.memberCount = reply.length;
    });
    $scope.toasts = toastService.toasts;
    $scope.toastService = toastService;

    $scope.xs = screenSize.on('xs', function(match){
      $scope.xs = match;
    });

    $scope.updateOrgDescription = function (newValue) {
      Organization.update({id: $stateParams.orgId}, { description: newValue}, function (reply) {
        toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
      }, function (error) {
        toastService.createErrorToast(error, 'Could not update the organization\'s description.');
      });
    };
  }])

  // +++ Organization Screen Subcontrollers +++
  /// ==== Plans Controller
  .controller("PlansCtrl", ["$scope", "$state", "$modal", "planData", "orgScreenModel", "PlanVersion",
    function ($scope, $state, $modal, planData, orgScreenModel, PlanVersion) {

    $scope.plans = planData;
    orgScreenModel.updateTab('Plans');
    $scope.modalAnim = "default";

    $scope.goToPlan = function (plan) {
      PlanVersion.query({orgId: plan.organizationId, planId: plan.id}, function (versions) {
        $state.go('root.plan.overview', {orgId: plan.organizationId, planId: plan.id, versionId: versions[0].version});
      });
    };

    $scope.modalNewPlan = function() {
      $modal.open({
        templateUrl: "views/modals/modalNewPlan.html",
        size: "lg",
        controller: "NewPlanCtrl as ctrl",
        resolve: function() {},
        windowClass: $scope.modalAnim	// Animation Class put here.
      });

    };

  }])

  /// ==== Services Controller
  .controller("ServicesCtrl", ["$scope", "$state", "$modal", "svcData", "orgScreenModel", "ServiceVersion",
    function ($scope, $state, $modal, svcData, orgScreenModel, ServiceVersion) {

    $scope.services = svcData;
    orgScreenModel.updateTab('Services');


    $scope.modalAnim = "default";

    $scope.goToSvc = function (svc) {
      ServiceVersion.query({orgId: svc.organizationId, svcId: svc.id}, function (versions) {
        $state.go('root.service', {orgId: svc.organizationId, svcId: svc.id, versionId: versions[0].version});
      });
    };

    $scope.modalNewService = function() {
      $modal.open({
        templateUrl: "views/modals/modalNewService.html",
        size: "lg",
        controller: "NewServiceCtrl as ctrl",
        resolve: function() {},
        windowClass: $scope.modalAnim	// Animation Class put here.
      });

    };


  }])

  /// ==== Applications Controller
  .controller("ApplicationsCtrl", ["$scope", "$state", "$modal", "appData", "orgScreenModel", "ApplicationVersion",
    function ($scope, $state, $modal, appData, orgScreenModel, ApplicationVersion) {

      $scope.applications = appData;
      orgScreenModel.updateTab('Applications');


      $scope.modalAnim = "default";

      $scope.goToApp = function (app) {
        ApplicationVersion.query({orgId: app.organizationId, appId: app.id}, function (versions) {
          $state.go('root.application.overview', {orgId: app.organizationId, appId: app.id, versionId: versions[0].version});
        });
      };

    }])

  /// ==== Members Controller
  .controller("MembersCtrl", ["$scope", "memberData", "orgScreenModel", function ($scope, memberData, orgScreenModel) {

    $scope.members = memberData;
    orgScreenModel.updateTab('Members');


  }]);
// +++ End Organization Screen Subcontrollers +++



  // #end
})(window.angular);
