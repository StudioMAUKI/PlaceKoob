'use strict';

angular.module('placekoob.services')
.factory('RESTServer', function() {
  return {
    getURL: function() {
      if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
        return 'http://maukitest.cloudapp.net';
      } else {
        return '/mauki';
      }
    }
  }
})
.factory('RemoteAPIService', ['$http', 'RESTServer', 'StorageService', 'AppStatus', function($http, RESTServer, StorageService, AppStatus){
  var ServerUrl = RESTServer.getURL();

  function initCall(success, error) {
    $http({
      method: 'GET',
      url: ServerUrl + '/users/register/'
    })
    .then(function(result) {
      console.log(result);
      success(result.data);
    }, function(err) {
      console.error(err);
      error(err);
    });
  }

  function registerUser(success, error) {
    var auth_user_token = StorageService.getData('auth_user_token');
    if (auth_user_token) {
      console.log('User Registration already successed.');
      success(auth_user_token);
    } else {
      // 이경우에는 auth_vd_token도 새로 발급받아야 하므로, 혹시 남아있을 auth_vd_token 찌꺼기를 지워줘야 한다.
      StorageService.removeData('auth_vd_token');
      $http({
        method: 'POST',
        url: ServerUrl + '/users/register/'
      })
      .then(function(result) {
        console.log('User Registration successed.');
        StorageService.addData('auth_user_token', result.data.auth_user_token);
        AppStatus.setUserRegisterd(true);
        success(result.data.auth_user_token);
      }, function(err) {
        AppStatus.setUserRegisterd(false);
        error(err);
      });
    }
  }

  function loginUser(token, success, error) {
    $http({
      method: 'POST',
      url: ServerUrl + '/users/login/',
      data: JSON.stringify({ auth_user_token: token })
    })
    .then(function(result) {
      AppStatus.setUserLogined(true);
      success(result.data.result);
    }, function(err) {
      AppStatus.setUserLogined(false);
      error(err);
    });
  }

  function registerVD(success, error) {
    var auth_vd_token = StorageService.getData('auth_vd_token');
    var email = StorageService.getData('email');
    if (auth_vd_token) {
      console.log('VD Registration already successed.');
      success(auth_vd_token);
    } else {
      $http({
        method: 'POST',
        url: ServerUrl + '/vds/register/',
        data: JSON.stringify({ email: email })
      })
      .then(function(result) {
        console.log('VD Registration successed.');
        StorageService.addData('auth_vd_token', result.data.auth_vd_token);
        AppStatus.setVDRegisterd(true);
        success(result.data.auth_vd_token);
      }, function(err) {
        AppStatus.setVDRegisterd(false);
        error(err);
      });
    }
  }

  function loginVD(token, success, error) {
    $http({
      method: 'POST',
      url: ServerUrl + '/vds/login/',
      data: JSON.stringify({ auth_vd_token: token })
    })
    .then(function(result) {
      AppStatus.setVDLogined(true);
      StorageService.addData('auth_vd_token', result.data.auth_vd_token);
      success(result.data.auth_vd_token);
    }, function(err) {
      AppStatus.setVDLogined(false);
      error(err);
    });
  }

  function hasEmail() {
    var email = StorageService.getData('email');
    return (email !== null);
  }

  return {
    initCall: initCall,
    registerUser: registerUser,
    loginUser: loginUser,
    registerVD: registerVD,
    loginVD: loginVD,
    hasEmail: hasEmail
  }
}]);
