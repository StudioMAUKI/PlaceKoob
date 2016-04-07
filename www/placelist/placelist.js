'use strict';

angular.module('placekoob.controllers')
.controller('placeListCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$state', '$q', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $state, $q, RemoteAPIService, PostHelper) {
	var placeList = this;
	placeList.postHelper = PostHelper;

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

	placeList.onItemDelete = function(post) {
		console.log('onItemDelete is invoked, but not implemented yet.');
	};

	placeList.edit = function(post) {
		console.log('edit is invoked');
	};

	placeList.share = function(post) {
		console.log('share is invoked');
	};

	placeList.loadSavedPlace = function() {
		var deferred = $q.defer();
		console.log('placelistCtrl: loadSavedPlace() called.');
		RemoteAPIService.getPostsOfMine(100, 0)
		.then(function(posts) {
			placeList.posts = posts;
			deferred.resolve();
		});

		return deferred.promise;
	}

	placeList.doRefresh = function() {
		placeList.loadSavedPlace()
		.finally(function(){
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	placeList.loadSavedPlace();

	$scope.$on('post.list.update', placeList.loadSavedPlace);
}]);
