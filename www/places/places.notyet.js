'use strict';

angular.module('placekoob.controllers')
.controller('placesNotYetCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$state', '$q', '$ionicHistory', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $state, $q, $ionicHistory, RemoteAPIService, PostHelper) {
	var plNotYet = this;
	plNotYet.postHelper = PostHelper;
	plNotYet.orderingType = "최신순";

	plNotYet.goBack = function() {
		// $state.go('tab.places');
		$ionicHistory.goBack();
	};

	plNotYet.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

	plNotYet.popOverOrdering = function($event) {
		console.log('popOverOrdering invoked.');
		$ionicPopover.fromTemplateUrl('popover-ordering.html', {
			scope: $scope,
		})
		.then(function(popover){
			plNotYet.popOverOrdering = popover;
			plNotYet.popOverOrdering.show($event);
		});
	};

	plNotYet.orderByDate = function() {
		console.log("plNotYet.orderByData is invoked.");
	};

	plNotYet.orderByDistance = function() {
		console.log('plNotYet.orderByDistance is invoked.');
	};

	plNotYet.onItemDelete = function(post) {
		console.log('onItemDelete is invoked, but not implemented yet.');
	};

	plNotYet.edit = function(post) {
		console.log('edit is invoked');
	};

	plNotYet.share = function(post) {
		console.log('share is invoked');
	};

	plNotYet.loadSavedPlace = function() {
		var deferred = $q.defer();
		console.log('placesCtrl: loadSavedPlace() called.');
		RemoteAPIService.getPostsOfMine(100, 0)
		.then(function(posts) {
			var results = [];
			for (var i = 0; i < posts.length; i++) {
				posts[i].tags = plNotYet.postHelper.getTags(posts[i]);
				if (!plNotYet.postHelper.isOrganized(posts[i])){
					results.push(posts[i]);
				}
			}
			plNotYet.posts = results;
			deferred.resolve();
		});

		return deferred.promise;
	}

	plNotYet.doRefresh = function() {
		plNotYet.loadSavedPlace()
		.finally(function(){
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	plNotYet.loadSavedPlace();

	$scope.$on('post.list.update', plNotYet.loadSavedPlace);
}]);
