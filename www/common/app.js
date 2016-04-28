// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
'use strict';

angular.module('placekoob', ['ionic','ionic.service.core', 'ngCordova', 'ngCordovaOauth', 'uiGmapgoogle-maps', 'placekoob.config', 'placekoob.controllers', 'placekoob.services'])
.run(['$rootScope', '$ionicPlatform', '$ionicPopup', '$state', 'RemoteAPIService', 'StorageService',  function($rootScope, $ionicPlatform, $ionicPopup, $state, RemoteAPIService, StorageService) {
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
          var arr = result.value.split('-');
          StorageService.set('lang', arr[0]);
          StorageService.set('country', arr[1]);
        },
        function(error) {
          console.error(error);
      });
    } else {
      StorageService.set('lang', 'ko');
      StorageService.set('country', 'KR');
    }

    // // 유저 등록
    // RemoteAPIService.registerUser()
    // .then(function(result) {
    //   console.log('auth_user_token: ' + result);
    //
    //   // 유저 로그인
    //   RemoteAPIService.loginUser(result)
    //   .then(function(result) {
    //     console.log('User Login successed : ' + result);
    //
    //     // 이메일 정보를 가지고 있는가?
    //     if (RemoteAPIService.hasEmail()) {
    //       // VD 등록
    //       RemoteAPIService.registerVD()
    //       .then(function(result) {
    //         console.log('auth_vd_token: ' + result);
    //
    //         // VD 로그인
    //         RemoteAPIService.loginVD(result)
    //         .then(function(result) {
    //           console.log('VD Login successed : ' + result);
    //           $rootScope.$broadcast('user.logined.after');
    //         }, function(err) {
    //           console.error(err);
    //           showAlert('서버 접속 중 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
    //         });
    //       }, function(err) {
    //         console.error(err);
    //         showAlert('이메일 등록 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
    //       });
    //     } else {
    //       // 초기 등록 과정으로 넘김
    //       $state.go('register');
    //     }
    //   }, function(err) {
    //     console.error(err);
    //     //showAlert('사용자 로그인 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
    //     showAlert(JSON.stringify(err));
    //   });
    // }, function(err) {
    //   console.error('User Registration failed: ' + JSON.stringify(err));
    //   showAlert('사용자 등록 과정에서 오류가 발생했습니다. 앱을 종료해주세요.ㅠㅠ');
    // });

    //  새로운 장소가 저장되었다는 이벤트를 감지하면, 다른 뷰의 목록도 갱신하도록 전달
    //  현재는 개별 저장에 대해서만 작동하도록 되어 있음
    $rootScope.$on('post.created', function() {
      console.log('RootScope received the event of post.created.');
      $rootScope.$broadcast('post.list.update');
    });

    $rootScope.$on('user.logouted', function() {
      console.log('RootScope received the event of user.logouted.');
      $rootScope.$broadcast('post.list.update');
    });

    $rootScope.$on('user.logined', function() {
      console.log('Login process completed.');
      $rootScope.$broadcast('user.logined.after');
    });

    $rootScope.$on('server.changed', function() {
      console.log('Server changed.');
      $rootScope.$broadcast('server.changed.after');
    });

    $rootScope.$on('map.request.gotocurrent', function() {
      console.log('Go to current position.');
      $rootScope.$broadcast('map.request.gotocurrent.after');
    });

    $rootScope.$on('map.request.refresh', function() {
      console.log('Refresh current position.');
      $rootScope.$broadcast('map.request.refresh.after');
    });
  });
}]);
