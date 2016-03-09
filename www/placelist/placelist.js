'use strict';

angular.module('placekoob.controllers')
.controller('placeListCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$state', 'placeListService', function($scope, $ionicSideMenuDelegate, $ionicPopover, $state, placeListService) {
	var placeList = this;

	placeList.orderingType = "최신순";
	placeList.showDelete = false;

	placeList.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

	placeList.popOverOrdering = function($event) {
		console.log('popOverOrdering invoked.');
		$ionicPopover.fromTemplateUrl('popover-ordering.html', {
			scope: $scope,
		})
		.then(function(popover){
			placeList.popOverOrdering = popover;
			placeList.popOverOrdering.show($event);
		});
	};

	placeList.orderByDate = function() {
		console.log("placeList.orderByData is invoked.");
	};

	placeList.orderByDistance = function() {
		console.log('placeList.orderByDistance is invoked.');
	};

	placeList.getTagString = function(tags) {
		return placeListService.getTagString(tags);
	};

	placeList.getFeeling = function(feeling) {
		return placeListService.getFeeling(feeling);
	};

	placeList.onItemDelete = function(objName, item) {
		console.log("onItemDelete is invoked");
		placeList.places[objName].splice(placeList.places[objName].indexOf(item), 1);
	};

	placeList.edit = function(item) {
		console.log("edit is invoked");
	};

	placeList.share = function(item) {
		console.log("share is invoked");
	};

	placeList.places = placeListService.getPlaces();
}]);
