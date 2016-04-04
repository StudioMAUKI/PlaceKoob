// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
'use strict';

angular.module('placekoob', ['ionic', 'ngCordova', 'ngCordovaOauth', 'uiGmapgoogle-maps', 'placekoob.config', 'placekoob.controllers', 'placekoob.services'])
.run(['$ionicPlatform', '$ionicPopup', 'PKDBManager', 'PKQueries', 'RemoteAPIService', 'StorageService', 'AppStatus', function($ionicPlatform, $ionicPopup, PKDBManager, PKQueries, RemoteAPIService, StorageService, AppStatus) {
  $ionicPlatform.ready(function() {
    function showAlert(msg) {
      var alertPopup = $ionicPopup.alert({
        title: '오류가 발생했습니다',
        template: msg
      })
      .then(function(res) {
        console.log('앱을 종료할려는데..');
        ionic.Platform.exitApp();
      });
    };

    // 데이터 관리를 위한 DB 생성
    PKDBManager.execute(PKQueries.createPlaces)
    .then(function(result) {
      console.log(result);
    }, function(error) {
      console.error(error);
    });

    // 유저 등록
    var auth_user_token = StorageService.getData('auth_user_token');
    if (!auth_user_token) {
      RemoteAPIService.registerUser(function(result) {
        console.log('auth_user_token: ' + result);
        StorageService.addData('auth_user_token', result);
        AppStatus.setUserRegisterd(true);
        auth_user_token = result;
        console.log('User Registration successed.');
      }, function(err) {
        AppStatus.setUserRegisterd(false);
        console.error('User Registration failed: ' + JSON.stringify(err));

        showAlert('사용자 등록 과정에서 오류가 발생하여 앱을 종료합니다.');
      });
    } else {
      console.log('auth_user_token: ' + auth_user_token);
    }

    // 유저 로그인
    RemoteAPIService.loginUser(auth_user_token, function(result) {
      console.log('Login successed : ' + result);
      AppStatus.setUserLogined(true);
    }, function(err) {
      console.error(err);
      showAlert('사용자 로그인 과정에서 오류가 발생하여 앱을 종료합니다.');
    });

    // VD 등록





    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}]);
