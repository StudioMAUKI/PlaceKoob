// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
'use strict';

angular.module('placekoob', ['ionic','ionic.service.core', 'ngCordova', 'ngCordovaOauth', 'placekoob.config', 'placekoob.controllers', 'placekoob.services'])
.run(['$rootScope', '$ionicPlatform', '$ionicPopup', '$state', 'RemoteAPIService', 'StorageService', 'MapService', function($rootScope, $ionicPlatform, $ionicPopup, $state, RemoteAPIService, StorageService, MapService) {
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

    MapService.watchCurrentPosition(function(pos) {
      $rootScope.$broadcast('map.position.update', pos);
    }, function(err) {
      console.dir(err);
    });

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

    if (ionic.Platform.isIOS()) {
      document.body.classList.remove('platform-android');
      document.body.classList.add('platform-ios');
    } else if (ionic.Platform.isAndroid()) {
      document.body.classList.remove('platform-ios');
      document.body.classList.add('platform-android');
    } else {
      document.body.classList.remove('platform-ios');
      document.body.classList.remove('platform-android');
      document.body.classList.add('platform-ionic');
    }
    //document.body.classList.add('platform-ios');

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
