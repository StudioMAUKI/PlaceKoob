'use strict';

angular.module('placekoob.controllers')
.controller('placesCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPopover', '$state', '$stateParams', '$q', 'RemoteAPIService', 'PostHelper', function($scope, $ionicSideMenuDelegate, $ionicPopover, $state, $stateParams, $q, RemoteAPIService, PostHelper) {
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

	places.share = function(post) {
		console.log('share is invoked');
	};

	places.loadSavedPlace = function() {
		var deferred = $q.defer();
		console.log('placesCtrl: loadSavedPlace() called.');
		RemoteAPIService.getPostsOfMine(1000, 0)
		.then(function(posts) {
			var results = [];
			for (var i = 0; i < posts.length; i++) {
				posts[i].tags = places.postHelper.getTags(posts[i]);
				if (places.postHelper.isOrganized(posts[i])){
					results.push(posts[i]);
				}
			}
			places.posts = results;
			places.notYetCount = posts.length - results.length;
			deferred.resolve();
		});

		return deferred.promise;
	}

	places.doRefresh = function() {
		places.loadSavedPlace()
		.finally(function(){
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	places.loadSavedPlace();
	$scope.$on('post.list.update', places.loadSavedPlace);

	if ($stateParams.place_id) {
		console.log('PlaceID를 넘겨 받음 : ' + $stateParams.place_id);
		$state.go('tab.place', {place_id: $stateParams.place_id});
	}
}]);
