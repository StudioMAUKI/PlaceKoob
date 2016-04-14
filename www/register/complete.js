'use strict';

angular.module('placekoob.controllers')
.controller('registerCompleteCtrl', ['$rootScope', '$scope', '$state', '$ionicHistory', '$ionicPopup', 'StorageService', 'RemoteAPIService', function($rootScope, $scope, $state, $ionicHistory, $ionicPopup, StorageService, RemoteAPIService) {
	console.log('registerCompleteCtrl is called.');
	var register = this;

	register.goHome = function() {
		$state.go('tab.home');
	};

	register.goBack = function() {
		$ionicHistory.goBack();
	}
}]);
