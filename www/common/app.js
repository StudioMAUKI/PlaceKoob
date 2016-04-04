// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
'use strict';

angular.module('placekoob', ['ionic', 'ngCordova', 'ngCordovaOauth', 'uiGmapgoogle-maps', 'placekoob.config', 'placekoob.controllers', 'placekoob.services'])
.run(['$ionicPlatform', 'PKDBManager', 'PKQueries', 'RemoteAPIService', function($ionicPlatform, PKDBManager, PKQueries, RemoteAPIService) {
  $ionicPlatform.ready(function() {
    PKDBManager.execute(PKQueries.createPlaces)
    .then(function(result) {
      console.log(result);
    }, function(error) {
      console.error(error);
    })
    .then(function() {
      RemoteAPIService.registerUser(function(result) {
        console.log('auth_user_token: ' + result);
      }, function(err) {
        console.error(err);
      });
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
  });
}]);
