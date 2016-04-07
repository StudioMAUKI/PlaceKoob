// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
'use strict';

angular.module('placekoob', ['ionic', 'ngCordova', 'ngCordovaOauth', 'uiGmapgoogle-maps', 'placekoob.config', 'placekoob.controllers', 'placekoob.services'])
.run(['$ionicPlatform', '$ionicPopup', '$state', 'RemoteAPIService', 'StorageService',  function($ionicPlatform, $ionicPopup, $state, RemoteAPIService, StorageService) {
  $ionicPlatform.ready(function() {
    function showAlert(msg) {
      $ionicPopup.alert({
        title: '오류가 발생했습니다',
        template: msg
      })
      .then(function(res) {
        console.log('앱을 종료할려는데..');
        ionic.Platform.exitApp();
      });
    };

    // 데이터 관리를 위한 DB 생성
    // PKDBManager.execute(PKQueries.createPlaces)
    // .then(function(result) {
    //   console.log(result);
    // }, function(error) {
    //   console.error(error);
    // });

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

    // 언어, 국가 정보 얻어오기. 이코드는 디바이스에서만 작동됨
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      navigator.globalization.getPreferredLanguage(function(result) {
          alert(JSON.stringify(result));
          var arr = result.value.split('-');
          StorageService.addData('lang', arr[0]);
          StorageService.addData('country', arr[1]);
        },
        function(error) {
          console.error(error);
      });
    } else {
      StorageService.addData('lang', 'ko');
      StorageService.addData('country', 'KR');
    }

    // 유저 등록
    RemoteAPIService.registerUser()
    .then(function(result) {
      console.log('auth_user_token: ' + result);

      // 유저 로그인
      RemoteAPIService.loginUser(result)
      .then(function(result) {
        console.log('User Login successed : ' + result);

        // 이메일 정보를 가지고 있는가?
        if (RemoteAPIService.hasEmail()) {
          // VD 등록
          RemoteAPIService.registerVD()
          .then(function(result) {
            console.log('auth_vd_token: ' + result);

            // VD 로그인
            RemoteAPIService.loginVD(result)
            .then(function(result) {
              console.log('VD Login successed : ' + result);
            }, function(err) {
              console.error(err);
              showAlert('서버 접속 중 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
            });
          }, function(err) {
            console.error(err);
            showAlert('이메일 등록 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
          });
        } else {
          // 초기 등록 과정으로 넘김
          $state.go('register');
        }
      }, function(err) {
        console.error(err);
        //showAlert('사용자 로그인 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
        showAlert(JSON.stringify(err));
      });
    }, function(err) {
      console.error('User Registration failed: ' + JSON.stringify(err));
      showAlert('사용자 등록 과정에서 오류가 발생했습니다. 앱을 종료해주세요.ㅠㅠ');
    });
  });
}]);
