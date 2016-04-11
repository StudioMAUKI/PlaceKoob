'use strict';

angular.module('placekoob.services')
.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}])
.factory('RESTServer', ['StorageService', function(StorageService) {
  return {
    getURL: function() {
      var devmode = StorageService.getData('devmode') === "true" ? true : false;

      if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
        if (devmode) {
          return 'http://192.168.1.3:8000';
        } else {
          return 'http://maukitest.cloudapp.net';
        }
      } else {
        if (devmode) {
          return '/mauki_dev';
        } else {
          return '/mauki';
        }
      }
    }
  }
}])
.factory('RemoteAPIService', ['$http', '$cordovaFileTransfer', '$q', 'RESTServer', 'StorageService', 'AppStatus', 'PostHelper', function($http, $cordovaFileTransfer, $q, RESTServer, StorageService, AppStatus, PostHelper){
  var ServerUrl = RESTServer.getURL();
  var cachedMyPosts = [];
  var cachedPostionedPosts = [];

  function registerUser() {
    var deferred = $q.defer();

    var auth_user_token = StorageService.getData('auth_user_token');
    if (auth_user_token) {
      console.log('User Registration already successed.');
      deferred.resolve(auth_user_token);
    } else {
      // 이경우에는 auth_vd_token도 새로 발급받아야 하므로, 혹시 남아있을 auth_vd_token 찌꺼기를 지워줘야 한다.
      StorageService.removeData('auth_vd_token');
      //StorageService.removeData('email'); //  원래 이메일도 날렸는데, 로그아웃 개념을 생각하면 안날려도 될듯

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

  function logoutUser() {
    StorageService.removeData('auth_user_token');
    StorageService.removeData('auth_vd_token');
    AppStatus.setUserLogined(false);
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
      deferred.resolve(result);
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
      $cordovaFileTransfer.upload(ServerUrl + '/rfs/', fileURI, options)
      .then(function(result) {
        console.dir(result.response);
        deferred.resolve(JSON.parse(result.response));
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      });
    } else {
      var fd = new FormData();
      fd.append('file', fileURI);
      $http.post(ServerUrl + '/rfs/', fd, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      })
      .then(function(result) {
        //console.dir(result);
        deferred.resolve(result.data);
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      })
      //deferred.resolve({uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'});
    }
    return deferred.promise;
  }

  function getPostsOfMine(limit, offset, force) {
    var deferred = $q.defer();
    var needToUpdate = false;

    //  캐쉬가 비어있지 않다면
    if (cachedMyPosts.length != 0) {
      if (force) {
        needToUpdate = true;
      } else {
        needToUpdate = false;
      }
    } else {
      needToUpdate = true;
    }

    if (needToUpdate) {
      console.log('캐시가 비어있거나, force=true 지정으로 인해 서버 호출')
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
        //console.dir(response.data);
        PostHelper.decoratePosts(response.data.results);
        cachedMyPosts = response.data.results;
        deferred.resolve(response.data.results);
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      });
    } else {
      console.log('캐시된 것 반환');
      deferred.resolve(cachedMyPosts);
    }

    return deferred.promise;
  }

  function getPostsWithPlace(lat, lon, radius, force) {
    var deferred = $q.defer();
    var needToUpdate = false;

    //  캐쉬가 비어있지 않다면
    if (cachedPostionedPosts.length != 0) {
      if (force) {
        needToUpdate = true;
      } else {
        needToUpdate = false;
      }
    } else {
      needToUpdate = true;
    }

    if (needToUpdate) {
      console.log('캐시가 비어있거나, force=true 지정으로 인해 서버 호출');
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
        //  !!!Start 성능을 생각하면 이렇게 하면 안되는데, 일단 급하니까 땜빵
        var retPosts = [];
        for (var i = 0; i < response.data.results.length; i++){
          if (response.data.results[i].userPost.lonLat || response.data.results[i].placePost.lonLat) {
            retPosts.push(response.data.results[i]);
          }
        }
        PostHelper.decoratePosts(retPosts);
        cachedPostionedPosts = retPosts;
        deferred.resolve(retPosts);
        //  !!!End

        // 요기서부터가 정식
        //deferred.resolve(response.data.results);
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      });
    } else {
      console.log('캐시된 것 반환');
      deferred.resolve(cachedPostionedPosts);
    }

    return deferred.promise;
  }

  function findPost(posts, place_id) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].place_id === place_id) {
        return posts[i];
      }
    }
    return null;
  }

  function getPost(place_id, force) {
    var deferred = $q.defer();
    var needToUpdate = false;
    var foundPost = null;
    
    getPostsOfMine(100, 0, force)
    .then(function(posts) {
      foundPost = findPost(posts, place_id);
      if (foundPost) {
        deferred.resolve(foundPost);
      } else {
        console.error(place_id + '에 해당하는 포스트를 찾을 수 없음.');
        var err = 'Could not find the post with such place_id.';
        deferred.reject(err);
      }
    }, function(err){
      deferred.reject(err);
    });

    return deferred.promise;
  }

  return {
    registerUser: registerUser,
    loginUser: loginUser,
    logoutUser: logoutUser,
    registerVD: registerVD,
    loginVD: loginVD,
    hasEmail: hasEmail,
    sendUserPost: sendUserPost,
    uploadImage: uploadImage,
    getPostsOfMine: getPostsOfMine,
    getPostsWithPlace: getPostsWithPlace,
    getPost: getPost
  }
}])
.factory('PostHelper', ['RESTServer', function(RESTServer) {
  function getTags(post) {
    if (!post.userPost || !post.userPost.notes || post.userPost.notes.length == 0 || post.userPost.notes[0].content === '') {
      return [];
    }

    return getTagsWithContent(post.userPost.notes[0].content);
  }

  function getTagsWithContent(content) {
    if (!content || content === '') {
        return [];
    }

    var words = content.split(/\s+/);
    var output = [];
    for (var i = 0; i < words.length; i++) {
      //  !!! 이거 열라 중요함! iOS 9.0 이상을 제외한 현재의 모바일 브라우저는 string.prototype.startsWith를 지원안함!
      //  덕분에 안드로이드에서는 태그가 작동안하던 버그가 있었음.
      if (words[i].charAt(0) === '#') {
        output.push(words[i].substring(1));
      }
    }

    return output;
  }

  function getUserNote(post) {
    if (!post.userPost || !post.userPost.notes || post.userPost.notes.length == 0 || post.userPost.notes[0].content === '') {
      return '';
    }

    return getUserNoteByContent(post.userPost.notes[0].content);
  }

  function getUserNoteByContent(content) {
    if (!content || content === '') {
      return '';
    }
    return content.replace(/#/g, '');
  }

  function getThumbnailUrlByFirstImage(post) {
    if (!post.userPost || !post.userPost.images || post.userPost.images.length == 0) {
      return 'img/icon/404.png';
    }
    return getImageURL(post.userPost.images[0].summary);
  }

  function getImageURL(content) {
    if (content === undefined || !content || content === '') {
      return 'img/icon/404.png';
    }

    if (content.indexOf('http://') !== 0) {
      return RESTServer.getURL() + '/' + content;
    }

    return content;
  }

  function getPlaceName(post) {
    // 장소의 이름은 공식 포스트의 이름을 우선한다.
    if (post.placePost && post.placePost.name && post.placePost.name !== '') {
      return post.placePost.name;
    } else if (post.userPost && post.userPost.name && post.userPost.name !== ''){
      return post.userPost.name;
    } else {
      return '미지정 상태';
    }
  }

  function getAddress(post) {
    // 주소는 공식 포스트의 주소를 우선한다.
    if (post.placePost && post.placePost.addrs && post.placePost.addrs.length != 0 && post.placePost.addrs[0].content !== '') {
      return post.placePost.addrs[0].content;
    } else if (post.userPost && post.userPost.addrs && post.userPost.addrs.length != 0 && post.userPost.addrs[0].content !== '') {
      return post.userPost.addrs[0].content;
    } else {
      return '미지정 상태';
    }
  }

  function getPhoneNo(post) {
    // 전화번호는 공식 포스트의 전화번호를 우선한다.
    if (post.placePost && post.placePost.phone && post.placePost.phone.content !== '') {
      return post.placePost.phone.content;
    } else if (post.userPost && post.userPost.phone && post.userPost.phone.content !== '') {
      return post.userPost.phone.content;
    } else {
      return '미지정 상태';
    }
  }

  function isOrganized(post) {
    //  공식적인 장소 이름이 규정이 되었다면, 장소화 되었다고 간주한다
    if (!post.placePost.name || post.placePost.name === '') {
      return false;
    } else {
      return true;
    }
  }

  function getTimeString(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }

  //  ng-repeat안에서 함수가 호출되는 것을 최대한 방지하기 위해, 로딩된 포스트의 썸네일 URL, 전화번호, 주소, 태그 등을
  //  계산해서 속성으로 담아둔다.
  function decoratePosts(posts) {
    for (var i = 0; i < posts.length; i++) {
      posts[i].name = getPlaceName(posts[i]);
      posts[i].thumbnailUrl = getThumbnailUrlByFirstImage(posts[i]);
      posts[i].datetime = getTimeString(posts[i].modified);
      posts[i].address = getAddress(posts[i]);
      posts[i].desc = getUserNote(posts[i]);
      posts[i].tags = getTags(posts[i]);
      posts[i].phoneNo = getPhoneNo(posts[i]);
    }
    // console.dir(posts);
  }

  return {
    getTagsWithContent: getTagsWithContent,
    getImageURL: getImageURL,
    isOrganized: isOrganized,
    getTimeString: getTimeString,
    decoratePosts: decoratePosts
  }
}]);
