'use strict';

angular.module('placekoob.controllers')
.controller('placesNotYetCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$ionicPopup', '$state', '$q', '$ionicListDelegate', '$ionicLoading', 'RemoteAPIService', 'PostHelper', 'starPointIconService', function($scope, $ionicSideMenuDelegate, $ionicPopover, $ionicPopup, $state, $q, $ionicListDelegate, $ionicLoading, RemoteAPIService, PostHelper, starPointIconService) {
	var plNotYet = this;
	plNotYet.postHelper = PostHelper;
	plNotYet.orderingType = "최신순";
	plNotYet.itemHeight = '99px';
	plNotYet.itemWidth = window.innerWidth + 'px';
	plNotYet.completedFirstLoading = false;
	plNotYet.SPS = starPointIconService;

	plNotYet.goBack = function() {
		$state.go('tab.places');
	};

	plNotYet.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

	plNotYet.popOverOrdering = function($event) {
		console.log('popOverOrdering invoked.');
		$ionicPopover.fromTemplateUrl('popover-ordering-not-yet.html', {
			scope: $scope,
		})
		.then(function(popover){
			plNotYet.popOver = popover;
			plNotYet.popOver.show($event);
		});
	};

	plNotYet.orderByDate = function() {
		console.log("plNotYet.orderByData is invoked.");
		plNotYet.popOver.hide();
	};

	plNotYet.orderByDistance = function() {
		console.log('plNotYet.orderByDistance is invoked.');
		plNotYet.popOver.hide();
	};

	plNotYet.onItemDelete = function(post) {
		console.log('onItemDelete is invoked, but not implemented yet.');
	};

	plNotYet.edit = function(post) {
		console.log('edit is invoked');
	};

	plNotYet.delete = function(post) {
		$ionicPopup.confirm({
			title: '장소 삭제',
			template: '정말로 저장한 장소를 지우시겠습니까?'
		})
		.then(function(res){
			if (res) {
				RemoteAPIService.deleteUserPost(post.uplace_uuid)
		    .then(function() {
		      $ionicPopup.alert({
		        title: '성공',
		        template: '삭제되었습니다'
		      });
		    }, function(err) {
		      console.error(err);
		    })
				.finally(function(){
					$ionicListDelegate.closeOptionButtons();
					plNotYet.loadSavedPlace('top');
				});
			} else {
				$ionicListDelegate.closeOptionButtons();
			}
		});
	};

	plNotYet.share = function(post) {
		console.log('share is invoked');
	};

	plNotYet.loadSavedPlace = function(position) {
		var deferred = $q.defer();
		var pos = position || 'top';

		if (plNotYet.completedFirstLoading === false) {
			$ionicLoading.show({
				template: '<ion-spinner icon="lines">로딩 중..</ion-spinner>'
			});
		}
		RemoteAPIService.getPostsOfMine(pos)
		.then(function(result) {
			plNotYet.posts = result.waiting;
			deferred.resolve();
			console.dir(plNotYet.posts);
		}, function(err) {
			console.error(err);
			deferred.reject(err);
		})
		.finally(function() {
			if (plNotYet.completedFirstLoading === false) {
				plNotYet.completedFirstLoading = true;
				$ionicLoading.hide();
			}
		});

		return deferred.promise;
	};

	plNotYet.isEndOfList = function() {
		return RemoteAPIService.isEndOfList('uplaces');
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

	// $scope.$on('$ionicView.afterEnter', function() {
	// 	plNotYet.loadSavedPlace();
	// });
	plNotYet.loadSavedPlace();
}]);
