'use strict';

angular.module('placekoob.controllers')
.controller('importUserCtrl', ['$scope', '$ionicPopup', '$ionicListDelegate', '$q', '$ionicLoading', 'RemoteAPIService', 'StorageService', function($scope, $ionicPopup, $ionicListDelegate, $q, $ionicLoading, RemoteAPIService, StorageService) {
	var importUser = this;
	importUser.totalCount = 0;
	importUser.iplaces = [];
	importUser.completedFirstLoading = false;

	importUser.isEndOfList = function() {
		return RemoteAPIService.isEndOfList('iplaces');
	};

	importUser.addUserImport = function() {
		var myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="importUser.userForImport">',
    title: '다른 사람의 장소 가져오기',
    subTitle: '가져올 사람의 e메일을 입력하세요',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>가져오기</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!importUser.userForImport) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return importUser.userForImport;
          }
        }
      }
    ]});

	  myPopup.then(function(res) {
	    console.log('Tapped!', res);
			if (res) {
				RemoteAPIService.importUser(res)
				.then(function(results) {
					importUser.loadIplaces();
				}, function(err) {
					console.error(err);
				});
			};
	  });
	};

	importUser.loadIplaces = function(position) {
		var deferred = $q.defer();
		position = position || 'top';
		var curPos = StorageService.get('curPos');
		console.log('loadIplaces : ' + position);

		if (importUser.completedFirstLoading === false) {
			$ionicLoading.show({
				template: '<ion-spinner icon="lines">로딩 중..</ion-spinner>'
			});
		}
		RemoteAPIService.getIplaces(position, curPos.latitude, curPos.longitude)
		.then(function(results) {
			// console.dir(results);
			importUser.iplaces = results.iplaces;
			importUser.totalCount = results.totalCount;
			deferred.resolve();
		}, function(err) {
			deferred.reject(err);
		})
		.finally(function() {
			if (importUser.completedFirstLoading === false) {
				$ionicLoading.hide();
				importUser.completedFirstLoading = true;
			}
		});

		return deferred.promise;
	};

	importUser.take = function(index) {
		console.log('importUser.take : ' + index);
		// console.dir(importUser.iplaces[index]);
		console.log(importUser.iplaces[index].iplace_uuid);
		RemoteAPIService.takeIplace(importUser.iplaces[index].iplace_uuid)
		.then(function(result) {
			// importUser.iplaces.splice(index, 1);
			importUser.totalCount = result.totalCount;
		}, function(err) {
			console.error(err);
		})
		.finally(function() {
			$ionicListDelegate.closeOptionButtons();
		});
	};

	importUser.drop = function(index) {
		console.log('importUser.drop : ' + index);
		console.dir(importUser.iplaces[index]);
		console.log(importUser.iplaces[index].iplace_uuid);
		RemoteAPIService.dropIplace(importUser.iplaces[index].iplace_uuid)
		.then(function(result) {
			// importUser.iplaces.splice(index, 1);
			importUser.totalCount = result.totalCount;
		}, function(err) {
			console.error(err);
		})
		.finally(function() {
			$ionicListDelegate.closeOptionButtons();
		});
	};

	importUser.doRefresh = function(direction) {
		if (direction === 'top') {
			importUser.loadIplaces('top')
			.finally(function(){
				$scope.$broadcast('scroll.refreshComplete');
			});
		} else if (direction === 'bottom') {
			importUser.loadIplaces('bottom')
			.finally(function(){
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}
	};

	importUser.loadIplaces('top');
}]);
