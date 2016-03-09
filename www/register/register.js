'use strict';

angular.module('placekoob.controllers')
.controller('registerCtrl', ['$scope', '$state', '$ionicHistory', function($scope, $state, $ionicHistory) {
	var register = this;
	register.goStep1 = function() {
		$state.go('register-step1');
	};

	register.goStep2 = function() {
		$state.go('register-step2');
	};

	register.goComplete = function() {
		$state.go('register-complete');
	};

	register.goHome = function() {
		$state.go('tab.home');
	};

	register.goBack = function() {
		$ionicHistory.goBack();
	}
}]);
