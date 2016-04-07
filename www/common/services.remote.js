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
      StorageService.removeData('email');

      $http({
        method: 'POST',
        url: ServerUrl + '/users/register/',
        country:StorageService.getData('country'),
        language:StorageService.getData('lang'),
        timezone:''
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
      url: ServerUrl + '/uplaces/',
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

  function getPostsOfMine(limit, offset) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: ServerUrl + '/uplaces/',
      params: {
        ru: 'myself',
        limit: limit,
        offset: offset
      }
    })
    .then(function(response) {
      console.dir(response.data);
      deferred.resolve(response.data.results);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getPostsWithPlace(lat, lon, radius) {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: ServerUrl + '/uplaces/',
      params: {
        lon: lon,
        lat: lat,
        r: radius
      }
    })
    .then(function(response) {
      //console.dir(response.data);
      deferred.resolve(response.data.results);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  return {
    registerUser: registerUser,
    loginUser: loginUser,
    registerVD: registerVD,
    loginVD: loginVD,
    hasEmail: hasEmail,
    sendUserPost: sendUserPost,
    uploadImage: uploadImage,
    getPostsOfMine: getPostsOfMine,
    getPostsWithPlace: getPostsWithPlace
  }
}])
.factory('PostHelper', ['RESTServer', function(RESTServer) {
  function getTags(post) {
    // if (!post.userPost || !post.userPost.notes || post.userPost.notes.length == 0 || post.userPost.notes[0].content === '') {
    //   return '태그를 뿌릴 내용이 없음';
    // }
    //
    // var words = post.userPost.notes[0].content.split(/\s+/);
    // var output = [];
    // for (var i = 0; i < words.length; i++) {
    //   if (words[i].startsWith('#')) {
    //     output.push(words[i]);
    //   }
    // }
    // //console.log(output);
    // return output;
    return ['test1', 'test2', 'test3'];
  }

  function getTagString(post) {
    if (!post.userPost || !post.userPost.notes || post.userPost.notes.length == 0 || post.userPost.notes[0].content === '') {
      return '태그를 뿌릴 내용이 없음';
    }

    // var tags = getTags(post.userPost.notes[0].content);
    // var result = '';
    // for (var i = 0; i < tags.length; i++){
    //   result += tags[i] + ' ';
    // }
    // return result;
    return post.userPost.notes[0].content;
  }

  function getUserNote(post) {
    if (!post.userPost || !post.userPost.notes || post.userPost.notes.length == 0 || post.userPost.notes[0].content === '') {
      return '태그를 뿌릴 내용이 없음';
    }

    return post.userPost.notes[0].content;
  }

  function getImageURL(post) {
    if (!post.userPost || !post.userPost.images || post.userPost.images.length == 0) {
      return 'img/icon/404.png';
    }
    if (post.userPost.images[0].content){
      return RESTServer.getURL() + post.userPost.images[0].content;
    } else {
      return '';
    }
  }

  function getPlaceName(post) {
    // 장소의 이름은 공식 포스트의 이름을 우선한다.
    if (!post.placePost && post.placePost.name && post.placePost.name !== '') {
      return post.placePost.name;
    } else if (!post.userPost && post.userPost.name && post.userPost.name !== ''){
      return post.userPost.name;
    } else {
      return '미지정 상태';
    }
  }

  function getAddress(post) {
    // 주소는 공식 포스트의 주소를 우선한다.
    if (!post.placePost && post.placePost.addrs && post.placePost.addrs.length != 0 && post.placePost.addrs[0].content !== '') {
      return post.placePost.addrs[0].content;
    } else if (!post.userPost && post.userPost.addrs && post.userPost.addrs.length != 0 && post.userPost.addrs[0].content !== '') {
      return post.userPost.addrs[0].content;
    } else {
      return '미지정 상태';
    }
  }

  function getPhoneNo(post) {
    // 전화번호는 공식 포스트의 전화번호를 우선한다.
    if (!post.placePost && post.placePost.phone && post.placePost.phone.content !== '') {
      return post.placePost.phone.content;
    } else if (!post.userPost && post.userPost.phone && post.userPost.phone.content !== '') {
      return post.userPost.phone.content;
    } else {
      return '미지정 상태';
    }
  }

  return {
    getTags: getTags,
    getTagString: getTagString,
    getUserNote: getUserNote,
    getImageURL: getImageURL,
    getPlaceName: getPlaceName,
    getAddress: getAddress,
    getPhoneNo: getPhoneNo
  }
}]);
