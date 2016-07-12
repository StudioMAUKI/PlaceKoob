'use strict';

angular.module('placekoob.controllers')
.controller('registerIntroCtrl', ['$rootScope', '$scope', '$state', function($rootScope, $scope, $state) {
	console.log('registerIntroCtrl is called.');
	var intro = this;

  intro.divToFit = function() {
    console.log('call divToFit');
		var documentHeight = $(document).height();
		// var barHeight = document.getElementsByTagName('ion-slide')[0].clientHeight || 44;
    // var buttonBarHeight = document.getElementsByClassName('button-bar')[0].clientHeight || 50;
		// var tabHeight = document.getElementsByClassName('tabs')[0].clientHeight || 49;
    $('#intro-slide').css({
			height: documentHeight
		});
	};

  intro.goToConfig = function() {
    $state.go('tab.config-home');
  }

  $scope.$on('$ionicView.afterEnter', function() {
		console.log('registerIntroView.afterEnter');
		intro.divToFit();
	});
}]);
