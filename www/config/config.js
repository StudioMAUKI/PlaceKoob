'use strict';

angular.module('placekoob.controllers')
.controller('configCtrl', ['$scope', '$http', '$cordovaOauth', '$ionicPopup', '$state', 'SocialService', 'StorageService', 'RemoteAPIService', function($scope, $http, $cordovaOauth, $ionicPopup, $state, SocialService, StorageService, RemoteAPIService) {
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

	if (SocialService.foursquare.token === '') {
    config.foursquare = false;
  } else {
    config.foursquare = true;
  }

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
  }

  config.requestUserInfo = function() {
    console.log("The request URL is " + SocialService.foursquare.getUserInfoURL('lists'));
    $http.get(SocialService.foursquare.getUserInfoURL('lists'))
    .then(function(result) {
      console.log("Response Object -> " + JSON.stringify(result));
    }, function(error) {
      console.log("Error -> " + error);
    });
  }

	config.connectOther = function() {
		config.google = false;
		config.naver = false;
		config.libraries = false;
		config.contacts = false;
	}

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
	}

	config.setDevMode = function (){
		StorageService.set('devmode', config.devmode);
		// 환경 바뀌면 로그아웃 해야 함
		config.logout();
	}
}]);
