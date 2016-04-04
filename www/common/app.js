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
    RemoteAPIService.registerUser(function(result) {
      console.log('auth_user_token: ' + result);

      // 유저 로그인
      RemoteAPIService.loginUser(result, function(result) {
        console.log('User Login successed : ' + result);

        RemoteAPIService.registerVD('hoonja@gmail.com', function(result) {
          console.log('auth_vd_token: ' + result);

          // VD 로그인
          RemoteAPIService.loginVD(result, function(result) {
            console.log('VD Login successed : ' + result);
          }, function(err) {
            console.error(err);
          });
        }, function(err) {
          console.error(err);
        });
      }, function(err) {
        console.error(err);
        showAlert('사용자 로그인 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
      });
    }, function(err) {
      console.error('User Registration failed: ' + JSON.stringify(err));

      showAlert('사용자 등록 과정에서 오류가 발생했습니다. 앱을 종료해주세요.ㅠㅠ');
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
