'use strict';

angular.module('placekoob.controllers')
.controller('importImageCtrl', ['$scope', '$ionicPopup', '$ionicListDelegate', '$q', '$ionicLoading', '$cordovaFile',  'RemoteAPIService', 'StorageService', 'remoteStorageService', 'imageImporter', function($scope, $ionicPopup, $ionicListDelegate, $q, $ionicLoading, $cordovaFile, RemoteAPIService, StorageService, remoteStorageService, imageImporter) {
	var importImage = this;
	importImage.started = false;
	importImage.paused = false;

	importImage.reset = function() {
    remoteStorageService.uploadData('uploaded_imgs', [])
    .then(function(result) {
      console.log('reset complete');
    }, function(err) {
			console.error(err);
		});

		// remoteStorageService.uploadData('test', ['a', 'b', 'c', 'd', 'e'])
    // .then(function(result) {
    //   console.log('save complete');
		// 	remoteStorageService.downloadData('test')
	  //   .then(function(result){
	  //     console.dir(JSON.parse(result.data.value));
	  //   });
    // });
  }

  importImage.start = function() {
		importImage.started = true;
    imageImporter.start(progress);
  };

  importImage.pause = function() {
		importImage.paused = true;
    imageImporter.pause();
  };

  importImage.resume = function() {
		importImage.paused = false;
    imageImporter.resume();
  };

  importImage.stop = function() {
		importImage.started = false;
		importImage.paused = false;
    imageImporter.stop();
  };

  function progress(status) {
    if (status.name === 'completed') {
			console.log('compleded received..');
      importImage.ratio = 100;
			importImage.started = false;
			importImage.paused = false;
			$scope.$apply();
    } else {
      importImage.ratio = Math.floor(100*status.current/status.total);
    }
    importImage.status = status;
  };
}]);
