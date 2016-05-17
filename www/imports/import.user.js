'use strict';

angular.module('placekoob.controllers')
.controller('importUserCtrl', ['$scope', '$ionicPopup', '$ionicListDelegate', '$q', '$ionicLoading', 'RemoteAPIService', 'StorageService', function($scope, $ionicPopup, $ionicListDelegate, $q, $ionicLoading, RemoteAPIService, StorageService) {
	var importUser = this;
	importUser.totalCount = 0;
	importUser.iplaces = [];

	importUser.isEndOfList = function() {
		return true;
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
			RemoteAPIService.importUser(res)
			.then(function(results) {
				importUser.loadIplaces();
			}, function(err) {
				console.error(err);
			})
	  });
	}

	importUser.loadIplaces = function() {
		var deferred = $q.defer();

		$ionicLoading.show({
			template: '<ion-spinner icon="lines"></ion-spinner>',
			duration: 60000
		});
		console.log('importUser.loadIplaces..');
		var curPos = StorageService.get('curPos');
		RemoteAPIService.getIplaces(curPos.latitude, curPos.longitude)
		.then(function(results) {
			importUser.iplaces = results.iplaces;
			importUser.totalCount = results.totalCount;
			deferred.resolve();
		}, function(err) {
			deferred.reject(err);
		})
		.finally(function() {
			$ionicLoading.hide();
		});

		return deferred.promise;
	}

	importUser.take = function(index) {
		console.log('importUser.take : ' + index);
		// console.dir(importUser.iplaces[index]);
		console.log(importUser.iplaces[index].iplace_uuid);
		RemoteAPIService.takeIplace(importUser.iplaces[index].iplace_uuid)
		.then(function() {
			importUser.iplaces.splice(index, 1);
			importUser.totalCount--;
		}, function(err) {
			console.error(err);
		})
		.finally(function() {
			$ionicListDelegate.closeOptionButtons();
		});
	}

	importUser.drop = function(index) {
		console.log('importUser.drop : ' + index);
		console.dir(importUser.iplaces[index]);
		console.log(importUser.iplaces[index].iplace_uuid);
		RemoteAPIService.dropIplace(importUser.iplaces[index].iplace_uuid)
		.then(function() {
			importUser.iplaces.splice(index, 1);
			importUser.totalCount--;
		}, function(err) {
			console.error(err);
		})
		.finally(function() {
			$ionicListDelegate.closeOptionButtons();
		});
	}

	importUser.doRefresh = function() {
		importUser.loadIplaces()
		.finally(function(){
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	$scope.$on('$ionicView.afterEnter', importUser.loadIplaces);
}]);
