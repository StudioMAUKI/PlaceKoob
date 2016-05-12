'use strict';

angular.module('placekoob.controllers')
.controller('placesCtrl', ['$scope', '$ionicScrollDelegate', '$ionicPopover', '$ionicPopup', '$state', '$stateParams', '$q', '$ionicListDelegate', 'RemoteAPIService', 'PostHelper', 'StorageService', function($scope, $ionicScrollDelegate, $ionicPopover, $ionicPopup, $state, $stateParams, $q, $ionicListDelegate, RemoteAPIService, PostHelper, StorageService) {
	var places = this;
	places.postHelper = PostHelper;
	places.orderingTypeName = ['-modified', 'modified', 'distance_from_origin', '-distance_from_origin'];
	places.orderingType = 0;
	places.showDelete = false;
	places.notYetCount = 0;
	places.itemHeight = '99px';
	places.itemWidth = window.innerWidth + 'px';
	places.completedFirstLoading = false;
	places.totalCount = 0;

	places.popOverOrdering = function(event) {
		$ionicPopover.fromTemplateUrl('popover-ordering.html', {
			scope: $scope,
		})
		.then(function(popover){
			places.popOver = popover;
			places.popOver.show(event);
		});
	};

	places.isActiveMenu = function(orderingType) {
		return places.orderingType === orderingType;
	}

	function sortByDate(a, b) {
		return a.created - b.created;
	}
	function sortByDistance(a, b) {
		return a.distance_from_origin - b.distance_from_origin;
	}

	function sortPosts(type, isAsc, preventDuple, delegationFunc) {
		if (preventDuple) {
			if (places.orderingType == type) {
				return;
			}
		}
		places.orderingType = type;
		var ascFactor = isAsc ? 1 : -1;
		places.posts.sort(function(a, b) {
			return delegationFunc(a, b) * ascFactor;
		})
	}

	places.changeOrderingType = function(type) {
		places.popOver.hide();
		if (places.orderingType !== type) {
			places.orderingType = type;
			RemoteAPIService.resetCachedPosts('uplaces');
			places.loadSavedPlace()
			.then(function() {
				$ionicScrollDelegate.scrollTop();
			});
		}
	}
	places.orderByDate = function(isRecent) {
		if (isRecent)
		console.log("places.orderByDate(" + isRecent + ") is invoked.");
		places.popOver.hide();
		sortPosts(0 + (isRecent ? 0 : 1), !isRecent, true, sortByDate);
	};

	places.orderByDistance = function(isNear) {
		console.log('places.orderByDistance is invoked.');
		places.popOver.hide();
		sortPosts(2 + (isNear? 0: 1), isNear, true, sortByDistance);
	};

	places.onItemDelete = function(post) {
		console.log('onItemDelete is invoked, but not implemented yet.');
	};

	places.edit = function(post) {
		console.log('edit is invoked');
	};

	places.delete = function(post) {
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
					places.loadSavedPlace();
				});
			} else {
				$ionicListDelegate.closeOptionButtons();
			}
		});
	}

	places.share = function(post) {
		console.log('share is invoked');
	};

	places.loadSavedPlace = function(position) {
		console.log('loadSavedPlace : ' + position);
		var deferred = $q.defer();
		var pos = position || 'top';
		var curPos = StorageService.get('curPos');
		var lon = curPos.longitude || null;
		var lat = curPos.latitude || null;

		RemoteAPIService.getPostsOfMine(pos, places.orderingTypeName[places.orderingType], lon, lat)
		.then(function(result) {
			places.posts = result.assigned;
			places.notYetCount = result.waiting.length;
			places.totalCount = result.totalCount;
			deferred.resolve();
			// console.dir(places.posts);
		}, function(err) {
			console.error(err);
		});

		return deferred.promise;
	}

	places.isEndOfList = function() {
		return RemoteAPIService.isEndOfList('uplaces');
	}

	places.doRefresh = function(direction) {
		console.log('doRefersh : ' + direction);
		if (places.completedFirstLoading){
			if (direction === 'top') {
				places.loadSavedPlace('top')
				.finally(function(){
					$scope.$broadcast('scroll.refreshComplete');
				});
			} else if (direction === 'bottom') {
				places.loadSavedPlace('bottom')
				.finally(function(){
					$scope.$broadcast('scroll.infiniteScrollComplete');
				});
			}
		} else {
			if (direction === 'top') {
				$scope.$broadcast('scroll.refreshComplete');
			} else if (direction === 'bottom') {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}
		}
	}

	$scope.$on('$ionicView.afterEnter', function() {
		places.loadSavedPlace('top')
		.then(function(){
			places.completedFirstLoading = true;
		});
	});

	if ($stateParams.uplace_uuid) {
		console.log('PlaceID를 넘겨 받음 : ' + $stateParams.uplace_uuid);
		$state.go('tab.place', {uplace_uuid: $stateParams.uplace_uuid});
	}
}]);
