'use strict';

angular.module('placekoob.controllers')
.controller('placesCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$ionicPopup', '$state', '$stateParams', '$q', '$ionicListDelegate', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $ionicPopup, $state, $stateParams, $q, $ionicListDelegate, RemoteAPIService, PostHelper) {
	var places = this;
	places.postHelper = PostHelper;
	places.orderingType = "최신순";
	places.showDelete = false;
	places.notYetCount = 0;

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
        places.loadSavedPlace(true);
      });
    }, function(err) {
      console.error(err);
    });
	}

	places.share = function(post) {
		console.log('share is invoked');
	};

	places.loadSavedPlace = function(force) {
		var deferred = $q.defer();
		RemoteAPIService.getPostsOfMine(100, 0, force)
		.then(function(posts) {
			places.posts = [];
			for (var i = 0; i < posts.length; i++) {
				if (places.postHelper.isOrganized(posts[i])){
					places.posts.push(posts[i]);
				}
			}
			places.notYetCount = posts.length - places.posts.length;
			deferred.resolve();
		});

		return deferred.promise;
	}

	places.doRefresh = function() {
		places.loadSavedPlace(true)
		.finally(function(){
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	places.loadSavedPlace();
	$scope.$on('posts.request.refresh.after', function() {
		places.loadSavedPlace(true);
	});

	if ($stateParams.uplace_uuid) {
		console.log('PlaceID를 넘겨 받음 : ' + $stateParams.uplace_uuid);
		$state.go('tab.place', {uplace_uuid: $stateParams.uplace_uuid});
	}
}]);
