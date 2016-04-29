'use strict';

angular.module('placekoob.controllers')
.controller('placesNotYetCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$ionicPopup', '$state', '$q', '$ionicHistory', '$ionicListDelegate', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $ionicPopup, $state, $q, $ionicHistory, $ionicListDelegate, RemoteAPIService, PostHelper) {
	var plNotYet = this;
	plNotYet.postHelper = PostHelper;
	plNotYet.orderingType = "최신순";
	plNotYet.itemHeight = '99px';
	plNotYet.itemWidth = window.innerWidth + 'px';

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
		console.log('loadSavedPlace called');
		var deferred = $q.defer();
		RemoteAPIService.getPostsOfMine(100, 0, force)
		.then(function(posts) {
			plNotYet.posts = [];
			for (var i = 0; i < posts.length; i++) {
				if (!plNotYet.postHelper.isOrganized(posts[i])){
					plNotYet.posts.push(posts[i]);
				}
			}
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

	$scope.$on('$ionicView.afterEnter', function() {
		console.log('After entering plNotYet View..');
		plNotYet.loadSavedPlace(true)
		.finally(function(){
			console.log('loadSavedPlace is completed');
		});
	});

}]);
