;(function() {
"use strict";


angular.module("app.ctrls", [])

// Root Controller
.controller("AppCtrl", ["$rootScope", "$scope", "$timeout", function($rs, $scope, $timeout) {
	var mm = window.matchMedia("(max-width: 767px)");
	$rs.isMobile = mm.matches ? true: false;

	$rs.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};

	mm.addListener(function(m) {
		$rs.safeApply(function() {
			$rs.isMobile = (m.matches) ? true : false;
		});
	});


	$scope.navFull = true;
	$scope.toggleNav = function() {
		$scope.navFull = $scope.navFull ? false : true;
		$rs.navOffCanvas = $rs.navOffCanvas ? false : true;
		console.log("navOffCanvas: " + $scope.navOffCanvas);

		$timeout(function() {
			$rs.$broadcast("c3.resize");
		}, 260);	// adjust this time according to nav transition
	};


	// ======= Site Settings
	$scope.toggleSettingsBox = function() {
		$scope.isSettingsOpen = $scope.isSettingsOpen ? false : true;
	};

	$scope.themeActive = "theme-zero";	// first theme

	$scope.fixedHeader = true;
	$scope.navHorizontal = false;	// this will access by other directive, so in rootScope.


	// === saving states
	var SETTINGS_STATES = "_setting-states";
	var statesQuery = {
		get : function() {
			return JSON.parse(localStorage.getItem(SETTINGS_STATES));
		},
		put : function(states) {
			localStorage.setItem(SETTINGS_STATES, JSON.stringify(states));
		}
	};

	// initialize the states
	var sQuery = statesQuery.get() || {
		navHorizontal: $scope.navHorizontal,
		fixedHeader: $scope.fixedHeader,
		navFull: $scope.navFull,
		themeActive: $scope.themeActive
	};
	// console.log(savedStates);
	if(sQuery) {
		$scope.navHorizontal = sQuery.navHorizontal;
		$scope.fixedHeader = sQuery.fixedHeader;
		$scope.navFull = sQuery.navFull;
		$scope.themeActive = sQuery.themeActive;
	}




	// putting the states
	$scope.onNavHorizontal = function() {
		sQuery.navHorizontal = $scope.navHorizontal;
		statesQuery.put(sQuery);
	};

	$scope.onNavFull = function() {
		sQuery.navFull = $scope.navFull;
		statesQuery.put(sQuery);

		$timeout(function() {
			$rs.$broadcast("c3.resize");
		}, 260);

	};

	$scope.onFixedHeader = function() {
		sQuery.fixedHeader = $scope.fixedHeader;
		statesQuery.put(sQuery);
	};

	$scope.onThemeActive = function() {
		sQuery.themeActive = $scope.themeActive;
		statesQuery.put(sQuery);
	};

	$scope.onThemeChange = function(theme) {
		$scope.themeActive = theme;
		$scope.onThemeActive();
	};



}])


.controller("HeadCtrl", ["$scope", "Fullscreen", function($scope, Fullscreen) {
	$scope.toggleFloatingSidebar = function() {
		$scope.floatingSidebar = $scope.floatingSidebar ? false : true;
		console.log("floating-sidebar: " + $scope.floatingSidebar);
	};

	$scope.goFullScreen = function() {
		if (Fullscreen.isEnabled())
        	Fullscreen.cancel();
      	else
         	Fullscreen.all()
	};


}])


/// ==== Dashboard Controller
.controller("DashboardCtrl", ["$scope", function($scope) {

  $scope.sorting = 'Popular';
  $scope.pricingFilter = 'All';

  $scope.availableAPIs = [{ name: "Petstore", logoUrl: "images/yeoman.png", owner: "Swagger Team", ownerLogoUrl: "images/admin.jpg", pricing: "FREE", users: 3234, followers: 232, uptimePercent: 100, description: 'Petstore swagger test API'},
    { name: "WeatherAPI", logoUrl: "images/yeoman.png", owner: "KMI", ownerLogoUrl: "images/sample/1.jpg", pricing: "PAID", users: 496, followers: 128, uptimePercent: 96, description: 'Returns weather forecasts for requested zip code'},
    { name: "Test API 1", logoUrl: "images/yeoman.png", owner: "Trust1Team", ownerLogoUrl: "images/sample/2.jpg", pricing: "FREEMIUM", users: 3234, followers: 232, uptimePercent: 50, description: 'Test Description'},
    { name: "Google Experimental API with very long name", logoUrl: "images/yeoman.png", owner: "Google",  ownerLogoUrl: "images/sample/3.jpg", pricing: "FREE", users: 22, followers: 8, uptimePercent: 5, description: 'Google API'},
    { name: "Facebook Profile API", logoUrl: "images/yeoman.png", owner: "Facebook", ownerLogoUrl: "images/sample/4.jpg", pricing: "FREEMIUM", users: 119320, followers: 9999, uptimePercent: 88, description: 'Test Description'}];

	$scope.analyticsconfig = {
		data: {
			columns: [
				['Network Load', 30, 100, 80, 140, 150, 200],
				['CPU Load', 90, 100, 170, 140, 150, 50]
			],
			type: 'spline',
			types: {
				'Network Load': 'bar'
			}
		},
		color: {
			pattern: ["#3F51B5",  "#38B4EE", "#4CAF50", "#E91E63"]
		},
		legend: {
			position: "inset"
		},
		size: {
			height: 330
		}
	};


	// ==== Usage Stats
	$scope.storageOpts = {
			size: 100,
			lineWidth: 2,
			lineCap: "square",
			barColor: "#E91E63"
		};
	$scope.storagePercent = 80;

	$scope.serverOpts = {
			size: 100,
			lineWidth: 2,
			lineCap: "square",
			barColor: "#4CAF50"
		};
	$scope.serverPercent = 35;

	$scope.clientOpts = {
			size: 100,
			lineWidth: 2,
			lineCap: "square",
			barColor: "#FDD835"
		};
	$scope.clientPercent = 54;


	// === browser share
	$scope.browserconfig = {
		data: {
			columns: [
			["Chrome", 48.9],
			["Firefox", 16.1],
			["Safari", 10.9],
			["IE", 17.1],
			["Other",7]
			],
			type: "donut",
		},
		size: {
			width: 260,
			height: 260
		},
		donut: {
			width: 50
		},
		color: {
			pattern: ["#3F51B5", "#4CAF50", "#f44336", "#E91E63", "#38B4EE"]
		}
	}
}])







// #end
})()
