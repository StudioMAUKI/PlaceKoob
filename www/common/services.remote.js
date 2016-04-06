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
.factory('RemoteAPIService', ['$http', '$cordovaFileTransfer', '$q', 'RESTServer', 'StorageService', 'AppStatus', function($http, $cordovaFileTransfer, $q, RESTServer, StorageService, AppStatus){
  var ServerUrl = RESTServer.getURL();

  function registerUser() {
    var deferred = $q.defer();

    var auth_user_token = StorageService.getData('auth_user_token');
    if (auth_user_token) {
      console.log('User Registration already successed.');
      deferred.resolve(auth_user_token);
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
        deferred.resolve(result.data.auth_user_token);
      }, function(err) {
        AppStatus.setUserRegisterd(false);
        deferred.reject(err);
      });
    }
    return deferred.promise;
  }

  function loginUser(token) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: ServerUrl + '/users/login/',
      data: JSON.stringify({ auth_user_token: token })
    })
    .then(function(result) {
      AppStatus.setUserLogined(true);
      deferred.resolve(result.data.result);
    }, function(err) {
      AppStatus.setUserLogined(false);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function registerVD() {
    var deferred = $q.defer();
    var auth_vd_token = StorageService.getData('auth_vd_token');
    var email = StorageService.getData('email');
    if (auth_vd_token) {
      console.log('VD Registration already successed.');
      deferred.resolve(auth_vd_token);
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
        deferred.resolve(result.data.auth_vd_token);
      }, function(err) {
        AppStatus.setVDRegisterd(false);
        deferred.reject(err);
      });
    }
    return deferred.promise;
  }

  function loginVD(token) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: ServerUrl + '/vds/login/',
      data: JSON.stringify({ auth_vd_token: token })
    })
    .then(function(result) {
      AppStatus.setVDLogined(true);
      StorageService.addData('auth_vd_token', result.data.auth_vd_token);
      deferred.resolve(result.data.auth_vd_token);
    }, function(err) {
      AppStatus.setVDLogined(false);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function hasEmail() {
    var email = StorageService.getData('email');
    return (email !== null);
  }

  function sendUserPost(sendObj){
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: ServerUrl + '/uposts/',
      data: JSON.stringify({ add: JSON.stringify(sendObj) })
    })
    .then(function(result) {
      //console.dir(result);
      deferred.resolve();
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function uploadImage(fileURI) {
    var deferred = $q.defer();

    // browser에서 개발하는 거 때문에 할수 없이 분기해서 처리..
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      var options = {
        fileKey: 'file',
        httpMethod: 'POST'
      };
      $cordovaFileTransfer.upload(ServerUrl + '/imgs/', fileURI, options)
      .then(function(result) {
        //console.dir(result);
        deferred.resolve(JSON.parse(result.response));
      }, function(err) {
        //console.error(err);
        deferred.reject(err);
      });
    } else {
      deferred.resolve({uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'});
    }
    return deferred.promise;
  }

  return {
    registerUser: registerUser,
    loginUser: loginUser,
    registerVD: registerVD,
    loginVD: loginVD,
    hasEmail: hasEmail,
    sendUserPost: sendUserPost,
    uploadImage: uploadImage
  }
}]);
