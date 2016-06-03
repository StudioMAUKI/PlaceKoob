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
      var devmode = StorageService.get('devmode') === "true" ? true : false;

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
.factory('remoteStorageService', ['$http', 'RESTServer', function($http, RESTServer) {
  var getServerURL = RESTServer.getURL;

  function downloadData(key) {
    return $http({
      method: 'GET',
      url: getServerURL() + '/storages/' + key + '/'
    });
  }

  function uploadData(key, data) {
    return $http({
      method: 'PATCH',
      url: getServerURL() + '/storages/' + key + '/',
      data: { value: JSON.stringify(data) }
    });
  }

  return {
    downloadData: downloadData,
    uploadData: uploadData
  };
}])
.factory('RemoteAPIService', ['$http', '$cordovaFileTransfer', '$q', 'RESTServer', 'StorageService', 'PostHelper', function($http, $cordovaFileTransfer, $q, RESTServer, StorageService, PostHelper){
  var getServerURL = RESTServer.getURL;
  var cachedUplaces = [];
  var cachedUplacesAssgined = [];
  var cachedUplacesWaiting = [];
  var cachedPlaces = [];
  var cacheMng = {
    uplaces: {
      endOfList: false,
      lastUpdated: 0,
      needToUpdate: true,
      totalCount: 0
    },
    places: {
      endOfList: false,
      lastUpdated: 0,
      needToUpdate: true
    }
  };

  function registerUser() {
    var deferred = $q.defer();

    var auth_user_token = StorageService.get('auth_user_token');
    if (auth_user_token) {
      console.log('User Registration already successed: ' + auth_user_token);
      deferred.resolve(auth_user_token);
    } else {
      // 이경우에는 auth_vd_token도 새로 발급받아야 하므로, 혹시 남아있을 auth_vd_token 찌꺼기를 지워줘야 한다.
      StorageService.remove('auth_vd_token');
      //StorageService.remove('email'); //  원래 이메일도 날렸는데, 로그아웃 개념을 생각하면 안날려도 될듯

      $http({
        method: 'POST',
        url: getServerURL() + '/users/register/',
        data: JSON.stringify({country:StorageService.get('country'),
        language:StorageService.get('lang'),
        timezone:''})
      })
      .then(function(result) {
        console.log('User Registration successed: ' + result.data.auth_user_token);
        StorageService.set('auth_user_token', result.data.auth_user_token);
        deferred.resolve(result.data.auth_user_token);
      }, function(err) {
        deferred.reject(err);
      });
    }
    return deferred.promise;
  }

  function loginUser(token) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: getServerURL() + '/users/login/',
      data: JSON.stringify({ auth_user_token: token })
    })
    .then(function(result) {
      deferred.resolve(result.data.result);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function logoutUser(step) {
    console.log('Login Step: ' + step);
    step = step || 0;
    if (step <= 2){
      StorageService.remove('auth_user_token');
    }

    if (step <= 4) {
      StorageService.remove('email');
      StorageService.remove('auth_vd_token');
    }
  }

  function registerVD() {
    var deferred = $q.defer();
    var auth_vd_token = StorageService.get('auth_vd_token');
    var email = StorageService.get('email');

    if (auth_vd_token) {
      console.log('VD Registration already successed: ' + auth_vd_token);
      deferred.resolve(auth_vd_token);
    } else {
      $http({
        method: 'POST',
        url: getServerURL() + '/vds/register/',
        data: JSON.stringify({ email: email })
      })
      .then(function(result) {
        console.log('VD Registration successed: ' + result.data.auth_vd_token);
        StorageService.set('auth_vd_token', result.data.auth_vd_token);
        deferred.resolve(result.data.auth_vd_token);
      }, function(err) {
        deferred.reject(err);
      });
    }
    return deferred.promise;
  }

  function loginVD(token) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: getServerURL() + '/vds/login/',
      data: JSON.stringify({ auth_vd_token: token })
    })
    .then(function(result) {
      console.log('VD Login successed: ' + result.data.auth_vd_token);
      StorageService.set('auth_vd_token', result.data.auth_vd_token);
      deferred.resolve(result.data.auth_vd_token);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function hasEmail() {
    var email = StorageService.get('email');
    return (email !== null);
  }

  function sendUserPost(sendObj){
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: getServerURL() + '/uplaces/',
      data: JSON.stringify({ add: JSON.stringify(sendObj) })
    })
    .then(function(result) {
      setAllNeedToUpdate();
      deferred.resolve(result);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function deleteUserPost(uplace_uuid) {
    var deferred = $q.defer();
    var ret_uplace_uuid = uplace_uuid.split('.')[0];
    $http({
      method: 'DELETE',
      url: getServerURL() + '/uplaces/' + ret_uplace_uuid + '/'
    })
    .then(function(result) {
      var idOrganized = -1, idUnorganized = -1;
      for (var i = 0; i < cachedUplaces.length; i++) {
        if (PostHelper.isOrganized(cachedUplaces[i])) {
          idOrganized++;
        } else {
          idUnorganized++;
        }
        if (uplace_uuid === cachedUplaces[i].uplace_uuid) {
          if (PostHelper.isOrganized(cachedUplaces[i])) {
            cachedUplacesAssgined.splice(idOrganized, 1);
          } else {
            cachedUplacesWaiting.splice(idUnorganized, 1);
          }
          cachedUplaces.splice(i, 1);
        }
      }
      setAllNeedToUpdate();
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
      $cordovaFileTransfer.upload(getServerURL() + '/rfs/', fileURI, options)
      .then(function(result) {
        // console.dir(result.response);
        deferred.resolve(JSON.parse(result.response));
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      });
    } else {
      var fd = new FormData();
      fd.append('file', fileURI);
      $http.post(getServerURL() + '/rfs/', fd, {
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

  function resetCachedPosts(type) {
    type = type || 'all';

    if (type === 'all') {
      cachedUplaces = [];
      cachedUplacesAssgined = [];
      cachedUplacesWaiting = [];
      cachedPlaces = [];
      cacheMng.uplaces.endOfList = false;
      cacheMng.uplaces.lastUpdated = 0;
      cacheMng.uplaces.needToUpdate = true;
      cacheMng.places.endOfList = false;
      cacheMng.places.lastUpdated = 0;
      cacheMng.places.needToUpdate = true;
    } else if (type === 'uplaces') {
      cachedUplaces = [];
      cachedUplacesAssgined = [];
      cachedUplacesWaiting = [];
      cacheMng.uplaces.endOfList = false;
      cacheMng.uplaces.lastUpdated = 0;
      cacheMng.uplaces.needToUpdate = true;
    } else if (type === 'places') {
      cachedPlaces = [];
      cacheMng.places.endOfList = false;
      cacheMng.places.lastUpdated = 0;
      cacheMng.places.needToUpdate = true;
    } else {
      console.warn('resetCachedPosts : unknown parameter');
    }
  }

  function isEndOfList(key) {
    return cacheMng[key].endOfList;
  }

  function setAllNeedToUpdate() {
    cacheMng.uplaces.needToUpdate = true;
    cacheMng.places.needToUpdate = true;
  }

  //  캐싱 로직은 세가지 요소 검사
  //  1. 현재 캐싱된 리스트가 비어 있는가?
  //  2. 마지막으로 업데이트 한 시간에서 1분이 지났는가?
  //  3. 업데이트 태그가 설정되어 있는가?
  function checkNeedToRefresh(key) {
    //  잠시 캐시 기능을 꺼보기로 함
    return true;

    if (key === 'uplaces') {
      if (cachedUplaces.length === 0){
        console.log('업데이트 필요 : 리스트가 비어 있음');
        return true;
      }
    } else if (key === 'places'){
      if (cachedPlaces.length === 0){
        console.log('업데이트 필요 : 리스트가 비어 있음');
        return true;
      }
    } else {
      console.warn('등록되지 않은 키(' + key + ')로 업데이트 여부를 체크했음')
      return true;
    }

    var timeNow = new Date().getTime();
    if (timeNow - cacheMng[key].lastUpdated >= 60000) {
      console.log('업데이트 필요 : 너무 오래 업데이트를 안 했음');
      return true;
    }
    if (cacheMng[key].needToUpdate) {
      console.log('업데이트 필요 : 업데이트 필요 태그가 세팅 됨');
      return true;
    }
    console.log('업데이트 필요 없음');
    // console.log('key : ' + key);
    // console.log('timeNow : ' + timeNow);
    // console.log('lastUpdated : ' + cacheMng[key].lastUpdated);
    // console.log('needToUpdate : ' + cacheMng[key].needToUpdate);
    return false;
  }

  function setRefreshCompleted(key) {
    cacheMng[key].needToUpdate = false;
    cacheMng[key].lastUpdated = new Date().getTime();
  }

  function updateCurPos(curPos) {
    if (cachedUplaces.length > 0) {
      PostHelper.updateDistance(cachedUplaces, curPos);
    }

    if (cachedUplacesAssgined.length > 0) {
      PostHelper.updateDistance(cachedUplacesAssgined, curPos);
    }

    if (cachedPlaces.length > 0) {
      PostHelper.updateDistance(cachedPlaces, curPos);
    }
  }

  function getPostsOfMine(position, orderBy, lon, lat) {
    console.info('getPostsOfMine : ' + position);
    var deferred = $q.defer();
    position = position || 'top';
    orderBy = orderBy || '-modified';
    if (orderBy === '-modified' || orderBy === 'modified') {
      lon = null;
      lat = null;
    } else {
      lon = lon || null;
      lat = lat || null;
    }

    var offset, limit;

    if (position === 'top') {
      offset = 0;
      limit = 20;
    } else if (position === 'bottom') {
      offset = cachedUplaces.length;
      limit = 20;

      if (cacheMng.uplaces.endOfList) {
        console.log('리스트의 끝에 다달았기 때문에 바로 리턴.');
        deferred.reject('endOfList');
        return deferred.promise;
      } else {
        cacheMng.uplaces.needToUpdate = true;  // 아래쪽에서 리스트를 추가하는 것은 항상 갱신을 시도해야 한다
      }
    } else {
      deferred.reject('Wrong parameter.');
      return deferred.promise;
    }

    if (checkNeedToRefresh('uplaces')) {
      $http({
        method: 'GET',
        url: getServerURL() + '/uplaces/',
        params: {
          ru: 'myself',
          limit: limit,
          offset: offset,
          order_by: orderBy,
          lon: lon,
          lat: lat,
          r: 0
        }
      })
      .then(function(response) {
        // console.dir(response.data.results);
        cacheMng.uplaces.totalCount = response.data.count;
        if (position === 'top') {
          var newElements = [];
          var found = false;
          for (var i = 0; i < response.data.results.length; i++) {
            found = false;
            for (var j = 0; j < cachedUplaces.length; j++) {
              // console.log(j);
              if (response.data.results[i].uplace_uuid === cachedUplaces[j].uplace_uuid) {
                found = true;
                break;
              }
            }
            if (!found) {
              newElements.push(response.data.results[i]);
            }
          }
          cachedUplaces = newElements.concat(cachedUplaces);
        } else {  //  position === 'bottom'
          if (response.data.results.length === 0) {
            cacheMng.uplaces.endOfList = true;
          } else {
            cachedUplaces = cachedUplaces.concat(response.data.results);
          }
        }

        cachedUplacesAssgined = [];
        cachedUplacesWaiting = [];
        PostHelper.decoratePosts(cachedUplaces);
        for (var i = 0; i < cachedUplaces.length; i++) {
          if (PostHelper.isOrganized(cachedUplaces[i])) {
            cachedUplacesAssgined.push(cachedUplaces[i]);
          } else {
            cachedUplacesWaiting.push(cachedUplaces[i]);
          }
        }
        deferred.resolve({assigned : cachedUplacesAssgined, waiting: cachedUplacesWaiting, totalCount: cacheMng.uplaces.totalCount});
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      })
      .finally(function() {
        setRefreshCompleted('uplaces');
      });
    } else {
      deferred.resolve({assigned : cachedUplacesAssgined, waiting: cachedUplacesWaiting, totalCount: cacheMng.uplaces.totalCount});
    }

    return deferred.promise;
  }

  function getPostsWithPlace(lat, lon, radius) {
    console.log('lat: ' + lat + ', lon: ' + lon + ', radius: ' + radius);
    var deferred = $q.defer();

    //  위치에 따라 리스트를 불러오는 로직에 캐시를 적용하는게 좋을지는 좀 더 고민해봐야겠어서 일단 주석처리
    // if (checkNeedToRefresh('places')) {
      $http({
        method: 'GET',
        url: getServerURL() + '/uplaces/',
        params: {
          lon: lon,
          lat: lat,
          r: radius
        }
      })
      .then(function(response) {
        // console.dir(response);
        cachedPlaces = [];
        for (var i = 0; i < response.data.results.length; i++){
          if (response.data.results[i].lonLat) {
            cachedPlaces.push(response.data.results[i]);
          }
        }
        PostHelper.decoratePosts(cachedPlaces);
        // console.dir(cachedPlaces);
        deferred.resolve(cachedPlaces);
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      })
      .finally(function() {
        setRefreshCompleted('places');
      });
    // } else {
    //   deferred.resolve(cachedPlaces);
    // }

    return deferred.promise;
  }

  function importUser(userEmail) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: getServerURL() + '/importers/',
      data: JSON.stringify({ guide: JSON.stringify({ type: 'user', email: userEmail })})
    })
    .then(function(result) {
      // console.dir(result);
      deferred.resolve(result);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function importImage() {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: getServerURL() + '/importers/',
      data: JSON.stringify({ guide: JSON.stringify({ type: 'images', vd: 'myself' })})
    })
    .then(function(result) {
      // console.dir(result);
      deferred.resolve(result);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getIplaces(lat, lon) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: getServerURL() + '/iplaces/',
      params: {
        ru: 'myself',
        lat: lat,
        lon: lon,
        r: 0
      }
    })
    .then(function(response) {
      // console.dir(response);
      PostHelper.decoratePosts(response.data.results);
      deferred.resolve({ iplaces: response.data.results, totalCount: response.data.count });
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });

    return deferred.promise;
  }

  function takeIplace(iplace_uuid) {
    var deferred = $q.defer();
    var ret_uplace_uuid = iplace_uuid.split('.')[0];
    console.log('ret_uplace_uuid : ' + ret_uplace_uuid);
    $http({
      method: 'POST',
      url: getServerURL() + '/iplaces/' + ret_uplace_uuid + '/take/'
    })
    .then(function(response) {
      // console.dir(response);
      deferred.resolve(response);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });

    return deferred.promise;
  }

  function dropIplace(iplace_uuid) {
    var deferred = $q.defer();
    var ret_uplace_uuid = iplace_uuid.split('.')[0];
    console.log('ret_uplace_uuid : ' + ret_uplace_uuid);
    $http({
      method: 'POST',
      url: getServerURL() + '/iplaces/' + ret_uplace_uuid + '/drop/'
    })
    .then(function(response) {
      // console.dir(response);
      deferred.resolve(response);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });

    return deferred.promise;
  }

  function getPost(uplace_uuid) {
    var deferred = $q.defer();
    var foundPost = null;
    var ret_uplace_uuid = uplace_uuid.split('.')[0];

    // 직접 질의
    $http({
      method: 'GET',
      url: getServerURL() + '/uplaces/' + ret_uplace_uuid + '/'
    })
    .then(function(response) {
      PostHelper.decoratePost(response.data);
      deferred.resolve(response.data);
    }, function(err) {
      console.error(err);
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
    deleteUserPost: deleteUserPost,
    uploadImage: uploadImage,
    getPostsOfMine: getPostsOfMine,
    getPostsWithPlace: getPostsWithPlace,
    getPost: getPost,
    updateCurPos: updateCurPos,
    resetCachedPosts: resetCachedPosts,
    isEndOfList: isEndOfList,
    importUser: importUser,
    importImage: importImage,
    getIplaces: getIplaces,
    takeIplace: takeIplace,
    dropIplace: dropIplace
  }
}])
.factory('PostHelper', ['RESTServer', 'StorageService', function(RESTServer, StorageService) {
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

  function getThumbnailURLByFirstImage(post) {
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
    // 장소의 이름은 공식 포스트의 이.content름을 우선한다.
    if (post.placePost && post.placePost.name && post.placePost.name.content !== '') {
      return post.placePost.name.content;
    } else if (post.userPost && post.userPost.name && post.userPost.name.content !== ''){
      return post.userPost.name.content;
    } else {
      return '';
    }
  }

  function getAddress(post) {
    // 주소는 공식 포스트의 주소를 우선한다.
    if (post.placePost) {
      if (post.placePost.addr1 && post.placePost.addr1.content !== '') {
        return post.placePost.addr1.content;
      } else if (post.placePost.addr2 && post.placePost.addr2.content !== '') {
        return post.placePost.addr2.content;
      } else if (post.placePost.addr3 && post.placePost.addr3.content !== '') {
        return post.placePost.addr3.content;
      }
    }

    if (post.userPost) {
      if (post.userPost.addr1 && post.userPost.addr1.content !== '') {
        return post.userPost.addr1.content;
      } else if (post.userPost.addr2 && post.userPost.addr2.content !== '') {
        return post.userPost.addr2.content;
      } else if (post.userPost.addr3 && post.userPost.addr3.content !== '') {
        return post.userPost.addr3.content;
      }
    }

    return '';
  }

  function getPhoneNo(post) {
    // 전화번호는 공식 포스트의 전화번호를 우선한다.
    if (post.placePost && post.placePost.phone && post.placePost.phone.content !== '') {
      return post.placePost.phone.content;
    } else if (post.userPost && post.userPost.phone && post.userPost.phone.content !== '') {
      return post.userPost.phone.content;
    } else {
      return '';
    }
  }

  function isOrganized(post) {
    //  placePost가 NULL이 아니면 장소화 된 것으로 간주할 수있음
    return (post.placePost !== null);
  }

  function getTimeString(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }

  function calcDistance(lat1, lon1, lat2, lon2)
	{
    function deg2rad(deg) {
  	  return (deg * Math.PI / 180);
  	}
  	function rad2deg(rad) {
  	  return (rad * 180 / Math.PI);
  	}

	  var theta = lon1 - lon2;
	  var dist = Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta));
	  dist = Math.acos(dist);
	  dist = rad2deg(dist);
	  dist = dist * 60 * 1.1515;
	  dist = dist * 1.609344;
	  return Number(dist*1000).toFixed(2);
	}

  function getDistance(post, curPos) {
    if (post.lonLat) {
      return calcDistance(curPos.latitude, curPos.longitude, post.lonLat.lat, post.lonLat.lon);
    } else {
      return null;
    }
  }

  //  ng-repeat안에서 함수가 호출되는 것을 최대한 방지하기 위해, 로딩된 포스트의 썸네일 URL, 전화번호, 주소, 태그 등을
  //  계산해서 속성으로 담아둔다.
  function decoratePost(post) {
    var curPos = StorageService.get('curPos');
    post.name = getPlaceName(post);
    post.thumbnailURL = getThumbnailURLByFirstImage(post);
    post.datetime = getTimeString(post.modified);
    post.address = getAddress(post);
    post.desc = getUserNote(post);
    post.tags = getTags(post);
    post.phoneNo = getPhoneNo(post);
  }

  function decoratePosts(posts) {
    for (var i = 0; i < posts.length; i++) {
      decoratePost(posts[i]);
    }
  }

  function updateDistance(posts, curPos) {
    for (var i = 0; i < posts.length; i++) {
      posts[i].distance_from_origin = getDistance(posts[i], curPos);
    }
  }

  return {
    getTagsWithContent: getTagsWithContent,
    getImageURL: getImageURL,
    isOrganized: isOrganized,
    getTimeString: getTimeString,
    decoratePost: decoratePost,
    decoratePosts: decoratePosts,
    updateDistance: updateDistance,
    calcDistance: calcDistance
  }
}])
.factory('imageImporter', ['$q', '$ionicPlatform', '$http', '$cordovaFileTransfer', 'RESTServer', 'photoEngineService', 'remoteStorageService', 'RemoteAPIService', function($q,  $ionicPlatform, $http, $cordovaFileTransfer, RESTServer, photoEngineService, remoteStorageService, RemoteAPIService) {
  var getServerURL = RESTServer.getURL;
  //  [URI, URI, ..]
  var uploadedImages = [];
  //  [{id, longitude, latitude, url}, {}, ... ]
  var imagesToUpload = [];
  var status = {
    name: 'notused',
    total: 0,
    current: 0
  };
  var timer = null;
  var progress = null;

  function updateProgress(stateName) {
    status.name = stateName;

    if (progress) {
      progress(status);
    }
  }

  function loadHistory() {
    var deferred = $q.defer();
    uploadedImages = [];
    remoteStorageService.downloadData('uploaded_imgs')
    .then(function(result) {
      uploadedImages = JSON.parse(result.data.value) || [];
      console.dir(uploadedImages);
      deferred.resolve();
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function saveHistory(url) {
    uploadedImages.push(url);
    remoteStorageService.uploadData('uploaded_imgs', uploadedImages);
  }

  function findImage(key) {
    for (var i = 0; i < uploadedImages.length; i++) {
      if (uploadedImages[i] === key) {
        return true;
      }
    }
    return false;
  }

  function convertToTimeString(timestamp) {
    //  '2015:04:22 11:54:19'
    var dd = new Date(timestamp * 1000);  // 자바스크립트는 초단위가 아닌 밀리초단위로 입력 받는다
    var result = '';
    var month = (dd.getUTCMonth() + 1) + ':';
    var day = dd.getUTCDate() + ' ';
    var hour = dd.getUTCHours() + ':';
    var min = dd.getUTCMinutes() + ':';
    var sec = dd.getUTCSeconds() + '';

    result += dd.getUTCFullYear() + ':';
    result += ((month.length === 2) ? '0' : '') + month;
    result += ((day.length === 2) ? '0' : '') + day;
    result += ((hour.length === 2) ? '0' : '') + hour;
    result += ((min.length === 2) ? '0' : '') + min;
    result += ((sec.length === 1) ? '0' : '') + sec;

    return result;
  }

  function uploadImage() {
    console.log('uploadImage..(status:' + status.name + ')');
    if (status.name !== 'ready') {
      return;
    } else {
      updateProgress('uploading');
    }

    while(findImage(imagesToUpload[status.current].url)) {
      status.current++;
      if (status.current === imagesToUpload.length) {
        complete();
        return;
      }
    }

    photoEngineService.getPhoto(imagesToUpload[status.current].id)
    .then(function(fileURI) {
      // console.log('image path : ' + fileURI);
      var options = {
        fileKey: 'file',
        httpMethod: 'POST'
      };
      $cordovaFileTransfer.upload(getServerURL() + '/rfs/', fileURI, options)
      .then(function(result) {
        var response = JSON.parse(result.response);
        // console.dir(response);
        // console.log('lon : ' + imagesToUpload[status.current].longitude);
        // console.log('lat : ' + imagesToUpload[status.current].latitude);
        // console.log('local_datetime : ' + imagesToUpload[status.current].timestamp);
        $http({
          method: 'POST',
          url: getServerURL() + '/imgs/',
          data: JSON.stringify({
            content: response.url,
            lon: imagesToUpload[status.current].longitude,
            lat: imagesToUpload[status.current].latitude,
            local_datetime: convertToTimeString(imagesToUpload[status.current].timestamp)
          })
        })
        .then(function(result) {
          // console.dir(result);
          photoEngineService.deletePhoto(imagesToUpload[status.current].id);
          saveHistory(imagesToUpload[status.current].url);
        }, function(err) {
          console.error('In posting to imgs :' + JSON.stringify(err));
          // console.dir(err);
        })
        .finally(function() {
          status.current++;
          updateProgress('ready');
          if (status.current === imagesToUpload.length) {
            complete();
          }
        });
      }, function(err) {
        console.error('In cordovaFileTransfer: ' + err);
      });
    }, function(err) {
      console.error('In uploadImage : ' + err);
    });
  }

  function start(prograssCallback) {
    progress = prograssCallback || null;
    status.total = 0;
    status.current = 0;
    uploadedImages = [];
    loadHistory()
    .then(function() {
      console.log('imageImporter start');
      photoEngineService.getPhotoList()
      .then(function(list) {
        imagesToUpload = list;
        status.total = imagesToUpload.length;
        // console.dir(imagesToUpload);
        updateProgress('ready');
        timer = setInterval(uploadImage, 100);
      }, function(err) {
        console.error(err);
      });
    });
  }

  function pause() {
    console.log('imageImporter pause');
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
      updateProgress('paused');
    }
  }

  function resume() {
    console.log('imageImporter resume');
    if (timer !== null) {
      return;
    }
    updateProgress('ready');
    timer = setInterval(uploadImage, 100);
  }

  function stop() {
    console.log('imageImporter stop');
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    updateProgress('stopped');
  }

  function complete() {
    console.log('imageImporter complete');
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    // create Importer
    RemoteAPIService.importImage()
    .then(function() {
      updateProgress('completed');
    }, function(err) {
      console.error(err);
    });
  }

  function getStatus() {
    return status;
  }

  return {
    getUploadedImages: function() { return uploadedImages; },
    getImagesToUpload: function() { return imagesToUpload; },
    start: start,
    pause: pause,
    resume: resume,
    stop: stop,
    getStatus: getStatus
  }
}]);
