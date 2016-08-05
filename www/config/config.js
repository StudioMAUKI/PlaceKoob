'use strict';

angular.module('placekoob.controllers')
.controller('configCtrl', ['$scope', '$http', '$cordovaOauth', '$ionicPopup', '$state', '$timeout', '$ionicLoading', 'SocialService', 'StorageService', 'RemoteAPIService',  'imageImporter', 'PKAuthStorageService', 'PhotoService', 'photoEngineService', function($scope, $http, $cordovaOauth, $ionicPopup, $state, $timeout, $ionicLoading, SocialService, StorageService, RemoteAPIService, imageImporter, PKAuthStorageService, PhotoService, photoEngineService) {
	var config = this;
	config.foursquare = false;
	config.google = false;
	config.naver = false;
	config.libraries = false;
	config.contacts = false;
	config.devmode = StorageService.get('devmode') === "true" ? true : false;

	// config.auth_user_token = StorageService.get('auth_user_token');
	// config.auth_vd_token = StorageService.get('auth_vd_token');
	PKAuthStorageService.init()
	.then(function() {
		config.email = PKAuthStorageService.get('email');
	});
	config.lang = StorageService.get('lang');
	config.country = StorageService.get('country');
	config.version = '0.1.6';
	config.imageImportButton = '업로드';
	config.imageImportStatus = 'stop';
	config.useCellNetwork = false;

	if (SocialService.foursquare.token === '') {
    config.foursquare = false;
  } else {
    config.foursquare = true;
  }

	$scope.$on('$ionicView.afterEnter', function() {
		console.log('config.$ionicView.afterEnter');
		if (StorageService.get('importImage') === 'started' && config.imageImportStatus === 'stop') {
			config.importImages();
		}
	});

  config.connectFoursqaure = function(){
    console.log(config.foursquare);
    if (config.foursquare) {
      // foursquare 로그인 작업을 함
      $cordovaOauth.foursquare('QEA4FRXVQNHKUQYFZ3IZEU0EI0FDR0MCZL0HEZKW11HUNCTW')
      .then(function(result){
        console.log("Response Object -> " + JSON.stringify(result));
        SocialService.foursquare.token = result;
      }, function(error){
        console.log("Error -> " + error);
      });
      console.log("Foursquare 켜졌음");
    } else {
      // foursquare 로그인을 끔
      console.log("Foursquare 꺼졌음");
      SocialService.foursquare.token = '';
    }
  };

  config.requestUserInfo = function() {
    console.log("The request URL is " + SocialService.foursquare.getUserInfoURL('lists'));
    $http.get(SocialService.foursquare.getUserInfoURL('lists'))
    .then(function(result) {
      console.log("Response Object -> " + JSON.stringify(result));
    }, function(error) {
      console.log("Error -> " + error);
    });
  };

	config.connectOther = function() {
		config.google = false;
		config.naver = false;
		config.libraries = false;
		config.contacts = false;
	};

	config.logout = function() {
		RemoteAPIService.logoutUser(0);
		$ionicPopup.alert({
			title: '로그아웃',
			template: '로그아웃했습니다.'
		})
		.then(function(res) {
			if (ionic.Platform.isAndroid()) {
				ionic.Platform.exitApp();
			} else {
				RemoteAPIService.resetCachedPosts();
				$state.go('register');
			}
		});
	};

	config.setDevMode = function (){
		StorageService.set('devmode', config.devmode);
		// 환경 바뀌면 로그아웃 해야 함
		config.logout();
	};

	config.goBack = function() {
    console.log('Move Back');
    $state.go('tab.config-home');
  };

	config.saveCellNetworkSetting = function() {
		StorageService.set('useCellNetwork', config.useCellNetwork);
	};

	config.importImages = function() {
		if (config.imageImportStatus === 'stop') {
			config.imageImportButton = '중지';
			config.imageImportStatus = 'start';
			config.startImportImages();
		} else if (config.imageImportStatus === 'start') {
			config.imageImportButton = '업로드';
			config.imageImportStatus = 'stop';
			config.stopImportImages();
		}
	};

	function progress(status) {
		$timeout(function() {
			if (status.name === 'completed') {
				console.log('compleded received..');
	      config.importImages();
	    } else {
	      config.ratio = Math.floor(100*status.current/status.total);
	    }
	    config.status = status;
		}, 1);
  };

	config.startImportImages = function() {
		console.log('startImportImages()');
		imageImporter.start(progress, config.useCellNetwork)
		.then(function() {
			StorageService.set('importImage', 'started');
		}, function() {
			StorageService.set('importImage', 'stoped');
		});
	};

	config.stopImportImages = function() {
		console.log('stopImportImages()');
		imageImporter.stop();
		StorageService.set('importImage', 'stoped');
	};

	config.importImagesBySelection = function() {
		PhotoService.getPhotoWithPhotoLibrary(10)
		.then(function(imageURIs) {
			// start
			console.dir(imageURIs);
			photoEngineService.getPhotoList()
			.then(function(list){
				console.dir(list);
			});
			// for (var i = 0; i < imageURIs.length; i++){
			// 	$ionicLoading.show({
			// 		template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
			// 		duration: 60000
			// 	});
			// 	RemoteAPIService.uploadImage(imageURIs[i])
			// 	.then(function(response) {
			// 		console.log('Image UUID: ' + response.uuid);
			// 		RemoteAPIService.sendUserPost({
			// 			images: [{
			// 				content: response.file
			// 			}],
			// 			uplace_uuid: place.uplace_uuid
			// 		})
			// 		.then(function(result) {
			// 			// place.loadPlaceInfo();
			// 			$ionicLoading.hide();
			// 			if (place.post.userPost.images === undefined || place.post.userPost.images === null || place.post.userPost.images.length === 0) {
			// 				place.post.userPost.images = [result.data.userPost.images[0]];
			// 				place.imagesForSlide = [result.data.userPost.images[0].content];
			// 				place.coverImage = result.data.userPost.images[0].summary;
			// 			} else {
			// 				place.post.userPost.images.splice(0, 0, result.data.userPost.images[0]);
			// 				place.imagesForSlide.splice(0, 0, result.data.userPost.images[0].content);
			// 			}
			// 		}, function(err) {
			// 			$ionicLoading.hide();
			// 			$ionicPopup.alert({
			// 				title: 'ERROR: Send user post',
			// 				template: JSON.stringify(err)
			// 			});
			// 		});
			// 	}, function(err) {
			// 		$ionicLoading.hide();
			// 		$ionicPopup.alert({
			// 			title: 'ERROR: Upload Image',
			// 			template: JSON.stringify(err)
			// 		});
			// 	});
			// }
			// end
		}, function(err) {
			console.error('PhotoService.getPhotoWithPhotoLibrary is failed', err);
		});
	};

	config.importUser = function() {
		var myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="config.userForImport">',
    title: '다른 사람의 장소 가져오기',
    subTitle: '가져올 사람의 e메일을 입력하세요',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>가져오기</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!config.userForImport) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return config.userForImport;
          }
        }
      }
    ]});

	  myPopup.then(function(res) {
	    console.log('Tapped!', res);
			if (res) {
				RemoteAPIService.importUser(res)
				.then(function(results) {
				 $ionicPopup.alert({
			     title: '요청 성공',
			     template: '가져오기를 요청했습니다. 가져온 목록은 \'하단탭>퍼온장소\'에 업데이트 됩니다.'
			   })
				 .then(function(res) {
			     console.log('Thank you for not eating my delicious ice cream cone');
			   });
				}, function(err) {
					console.error(err);
				});
			};
	  });
	};

	config.write = function() {
		PKAuthStorageService.init()
		.then(function() {
			PKAuthStorageService.set('key', 'test');
			PKAuthStorageService.set('auth_user_token', 'gAAAAABXiJ-irUbUSMtW6iogt4UijztRbyl8hBwn-jCEFEL3s7VliSU6TF1wfwp9LTAywc-2ywfgBF2r5vA1W0GFK9HroJLI4Fds4xt_8ziUohzpGW5pK5xhmrFg1cGIhbjEV49ziUHR');
			PKAuthStorageService.set('auth_vd_token', 'gAAAAABXlDM-Y6qMZeAYFPooxMyGLOZENsYqOYiXymFR_ySpYgYXHUs10JA569jNhSkw2OkRhGnla8gzEHJAppX7B-W58K9VOw==');
		});
	};

	config.read = function() {
		PKAuthStorageService.init()
		.then(function() {
			PKAuthStorageService.get('key');
			PKAuthStorageService.get('auth_user_token');
			PKAuthStorageService.get('auth_vd_token');
		});
	};

	config.reset = function() {
		PKAuthStorageService.reset();
	};
}]);
