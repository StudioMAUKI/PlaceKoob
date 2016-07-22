'use strict';

angular.module('placekoob.controllers')
.controller('configCtrl', ['$scope', '$http', '$cordovaOauth', '$ionicPopup', '$state', '$timeout', 'SocialService', 'StorageService', 'RemoteAPIService',  'imageImporter', function($scope, $http, $cordovaOauth, $ionicPopup, $state, $timeout, SocialService, StorageService, RemoteAPIService, imageImporter) {
	var config = this;
	config.foursquare = false;
	config.google = false;
	config.naver = false;
	config.libraries = false;
	config.contacts = false;
	config.devmode = StorageService.get('devmode') === "true" ? true : false;

	config.auth_user_token = StorageService.get('auth_user_token');
	config.auth_vd_token = StorageService.get('auth_vd_token');
	config.email = StorageService.get('email');
	config.lang = StorageService.get('lang');
	config.country = StorageService.get('country');
	config.version = '0.0.2';
	config.imageImportButton = '업로드 하기';
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
			config.imageImportButton = '업로드 중지';
			config.imageImportStatus = 'start';
			config.startImportImages();
		} else if (config.imageImportStatus === 'start') {
			config.imageImportButton = '업로드 하기';
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
}]);
