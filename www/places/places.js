'use strict';

angular.module('placekoob.controllers')
.controller('placesCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$ionicPopup', '$state', '$stateParams', '$q', '$ionicListDelegate', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $ionicPopup, $state, $stateParams, $q, $ionicListDelegate, RemoteAPIService, PostHelper) {
	var places = this;
	places.postHelper = PostHelper;
	places.orderingType = "최신순";
	places.showDelete = false;
	places.notYetCount = 0;
	places.itemHeight = '99px';
	places.itemWidth = window.innerWidth + 'px';
	places.endoflist = false;
	places.completedFirstLoading = false;

	places.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

	places.popOverOrdering = function($event) {
		console.log('popOverOrdering invoked.');
		$ionicPopover.fromTemplateUrl('popover-ordering.html', {
			scope: $scope,
		})
		.then(function(popover){
			places.popOverOrdering = popover;
			places.popOverOrdering.show($event);
		});
	};

	places.orderByDate = function() {
		console.log("places.orderByData is invoked.");
	};

	places.orderByDistance = function() {
		console.log('places.orderByDistance is invoked.');
	};

	places.onItemDelete = function(post) {
		console.log('onItemDelete is invoked, but not implemented yet.');
	};

	places.edit = function(post) {
		console.log('edit is invoked');
	};

	places.delete = function(post) {
		RemoteAPIService.deleteUserPost(post.uplace_uuid)
    .then(function() {
      $ionicPopup.alert({
        title: '성공',
        template: '삭제되었습니다'
      })
      .then(function() {
				$ionicListDelegate.closeOptionButtons();
        places.loadSavedPlace();
      });
    }, function(err) {
      console.error(err);
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
			places.posts = result.assined;
			places.notYetCount = result.waiting.length;
			deferred.resolve();
		}, function(err) {
			if (err === 'endoflist') {
				console.log('endoflist');
				places.endoflist = true;
			} else {
				console.err(err);
			}
		});

		return deferred.promise;
	}

	places.doRefresh = function(direction) {
		console.log('doRefersh');
		if (places.completedFirstLoading){
			if (direction === 'top') {
				places.loadSavedPlace()
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
