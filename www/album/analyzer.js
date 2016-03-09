'use strict';

angular.module('placekoob.controllers')
.controller('analyzerCtrl', ['$scope', function($scope, $state) {
	var analyzer = this;
	analyzer.goHome = function() {
		$state.go('home');
	};
}]);