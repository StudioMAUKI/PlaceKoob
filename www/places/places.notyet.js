'use strict';

angular.module('placekoob.controllers')
.controller('placesNotYetCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$ionicPopup', '$state', '$q', '$ionicHistory', '$ionicListDelegate', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $ionicPopup, $state, $q, $ionicHistory, $ionicListDelegate, RemoteAPIService, PostHelper) {
	var plNotYet = this;
	plNotYet.postHelper = PostHelper;
	plNotYet.orderingType = "최신순";
	plNotYet.itemHeight = '99px';
	plNotYet.itemWidth = window.innerWidth + 'px';
	plNotYet.endoflist = false;

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
        plNotYet.loadSavedPlace('top');
      });
    }, function(err) {
      console.error(err);
    });
	};

	plNotYet.share = function(post) {
		console.log('share is invoked');
	};

	plNotYet.loadSavedPlace = function(position) {
		var deferred = $q.defer();
		var pos = position || 'top';
		RemoteAPIService.getPostsOfMine(pos)
		.then(function(result) {
			plNotYet.posts = result.waiting;
			deferred.resolve();
		}, function(err) {
			if (err === 'endoflist') {
				console.log('endoflist');
				plNotYet.endoflist = true;
			} else {
				console.err(err);
			}
		});

		return deferred.promise;
	};

	plNotYet.doRefresh = function(direction) {
		if (direction === 'top') {
			plNotYet.loadSavedPlace()
			.finally(function(){
				$scope.$broadcast('scroll.refreshComplete');
			});
		} else if (direction === 'bottom') {
			plNotYet.loadSavedPlace('bottom')
			.finally(function(){
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}
	};

	$scope.$on('$ionicView.afterEnter', function() {
		plNotYet.loadSavedPlace();
	});
}]);
