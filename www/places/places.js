'use strict';

angular.module('placekoob.controllers')
.controller('placesCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$ionicPopup', '$state', '$stateParams', '$q', '$ionicListDelegate', 'RemoteAPIService', 'PostHelper', 'StorageService', function($scope, $ionicSideMenuDelegate, $ionicPopover, $ionicPopup, $state, $stateParams, $q, $ionicListDelegate, RemoteAPIService, PostHelper, StorageService) {
	var places = this;
	places.postHelper = PostHelper;
	places.orderingTypeName = ['최근의', '오래된', '가까운', '먼'];
	places.orderingType = 0;
	places.showDelete = false;
	places.notYetCount = 0;
	places.itemHeight = '99px';
	places.itemWidth = window.innerWidth + 'px';
	places.completedFirstLoading = false;

	places.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

	places.popOverOrdering = function(event) {
		$ionicPopover.fromTemplateUrl('popover-ordering.html', {
			scope: $scope,
		})
		.then(function(popover){
			places.popOver = popover;
			places.popOver.show(event);
		});
	};

	places.isActiveMenu = function(menuName) {
		return places.orderingTypeName[places.orderingType] == menuName;
	}

	function calcDistance(lat1, lon1, lat2, lon2)
	{
		function deg2rad(deg) {
		  return (deg * Math.PI / 180);
		}
		function rad2deg(rad) {
		  return (rad * 180 / Math.PI);
		}
	  var theta = lon1 - lon2;
	  var dist = Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta));
	  dist = Math.acos(dist);
	  dist = rad2deg(dist);
	  dist = dist * 60 * 1.1515;
	  dist = dist * 1.609344;
	  return Number(dist*1000).toFixed(2);
	}

	function sortByDate(a, b) {
		return a.created - b.created;
	}
	function sortByDistance(a, b) {
		return a.distance - b.distance;
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

	places.orderByDate = function(isRecent) {
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
		RemoteAPIService.getPostsOfMine(pos)
		.then(function(result) {
			//	정렬 기능 구현을 위해 배열을 shallow copy로 바꿔봄
			// places.posts = result.assigned;
			places.posts = result.assigned.slice();
			places.notYetCount = result.waiting.length;
			switch (places.orderingType) {
				case 1:
				sortPosts(1, true, false, sortByDate);
				break;
				case 2:
				sortPosts(2, true, false, sortByDistance);
				break;
				case 3:
				sortPosts(3, false, false, sortByDistance);
				break;
			}
			deferred.resolve();
			// console.dir(places.posts);
		}, function(err) {
			console.err(err);
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
