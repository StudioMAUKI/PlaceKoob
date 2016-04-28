'use strict';

angular.module('placekoob.controllers')
.controller('placesNotYetCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$ionicPopup', '$state', '$q', '$ionicHistory', '$ionicListDelegate', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $ionicPopup, $state, $q, $ionicHistory, $ionicListDelegate, RemoteAPIService, PostHelper) {
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

	plNotYet.delete = function(post) {
		RemoteAPIService.deleteUserPost(post.uplace_uuid)
    .then(function() {
      $ionicPopup.alert({
        title: '성공',
        template: '삭제되었습니다'
      })
      .then(function() {
				$ionicListDelegate.closeOptionButtons();
        plNotYet.loadSavedPlace(true);
      });
    }, function(err) {
      console.error(err);
    });
	};

	plNotYet.share = function(post) {
		console.log('share is invoked');
	};

	plNotYet.loadSavedPlace = function(force) {
		var deferred = $q.defer();
		console.log('placesCtrl: loadSavedPlace() called.');
		RemoteAPIService.getPostsOfMine(100, 0, force)
		.then(function(posts) {
			var results = [];
			for (var i = 0; i < posts.length; i++) {
				if (!plNotYet.postHelper.isOrganized(posts[i])){
					results.push(posts[i]);
				}
			}
			plNotYet.posts = results;
			deferred.resolve();
		});

		return deferred.promise;
	};

	plNotYet.doRefresh = function() {
		plNotYet.loadSavedPlace(true)
		.finally(function(){
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	plNotYet.loadSavedPlace();

	$scope.$on('post.list.update', plNotYet.loadSavedPlace);
}]);
