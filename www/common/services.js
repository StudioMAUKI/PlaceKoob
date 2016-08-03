'use strict';

angular.module('placekoob.services', [])
.factory('AppStatus', function() {
  var isUserRegistered = false;
  var isUserLogined = false;
  var isVDRegistered = false;
  var isVDLogined = false;

  return {
    isUserRegistered: function() {
      return isUserRegistered;
    },
    setUserRegisterd: function(val) {
      isUserRegistered = val;
    },
    isUserLogined: function() {
      return isUserLogined;
    },
    setUserLogined: function(val) {
      isUserLogined = val;
    },
    isVDRegistered: function() {
      return isVDRegistered;
    },
    setVDRegisterd: function(val) {
      isVDRegistered = val;
    },
    isVDLogined: function() {
      return isVDLogined;
    },
    setVDLogined: function(val) {
      isVDLogined = val;
    }
  }
})
.factory('md5Encrypter', [function() {
  return {
    encrypt: function(input) {
        return md5(input);
    }
  }
}])
.factory('UUIDGenerator', [function() {
  function getUUID() {
    var VD = '0000000000000000';
    var timestamp = Date.now().toString(16);
    var numOfZero = 16 - timestamp.length;
    for (var i = 0; i < numOfZero; i++) {
      timestamp = '0' + timestamp;
    }
    return VD + timestamp;
  }

  return { getUUID: getUUID };
}])
.factory('SocialService', [function() {
  var token_foursquare = '';
  token_foursquare = 'DT4A1FOHQ325BGFRTR3SWSWEMJBVRFF2YFVAYY1EGO3FPAQV';
  return {
    foursquare: {
      url_prefix: 'https://api.foursquare.com/v2/users/self',
      token : token_foursquare,
      client_id : 'QEA4FRXVQNHKUQYFZ3IZEU0EI0FDR0MCZL0HEZKW11HUNCTW',
      secret_key : '4VU0FLFOORV13ETKHN5UNYKGBNPZBAJ3OGGKC5E2NILYA2VD',
      version: '20160324',
      mode: 'foursquare',
      getUserInfoURL: function(aspect) {
        return this.url_prefix + (aspect? '/' + aspect : '') + '?oauth_token=' + this.token + '&v=' + this.version + '&m=' + this.mode;
      }
    }
  };
}])
.factory('PKQueries', [function() {
  return {
    place: {
      create: 'INSERT INTO Places (placeKey, address, tel, coords) VALUES (?, ?, ?, ?)',
      read: '',
      update: '',
      delete: '',
      list: ''
    },
    createPlaces:
      'CREATE TABLE IF NOT EXISTS Places (' +
        'placeKey TEXT PRIMARY KEY,' +
        'address TEXT,' +
        'tel TEXT,' +
        'coords TEXT)',
    resetPlaces:
      'DELETE FROM Places'
  };
}])
.factory('PKDBManager', ['$cordovaSQLite', function($cordovaSQLite) {
  var PKDB = null;

  function init() {
    if (PKDB) {
      close();
    }
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      PKDB = window.sqlitePlugin.openDatabase({name: 'placekoob.db'});
    } else {
      PKDB = window.openDatabase('placekoob.db', '1.0', 'Placekoob DB', 1024 * 1024 * 5);
    }
    //console.log('PKDBManager init is called.');
    return PKDB;
  }

  function close() {
    if (!PKDB) return PKDB;
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      PKDB.close(function () {
        console.log('Database is closed ok.');
      });
    }
    PKDB = null;
    return PKDB;
  }

  function execute(sqlStatement, sqlParam) {
    if (!PKDB) {
      this.init();
    }
    return $cordovaSQLite.execute(PKDB, sqlStatement, sqlParam);
  }

  return {
    getDB: function() { return PKDB },
    init: init,
    execute: execute,
    close: close
  };
}])
.factory('MapService', ['$q', 'StorageService', function($q, StorageService) {
  var pos = { latitude: 0.0, longitude: 0.0 };
  var warchID = null;

  function getCurrentPosition() {
    return $q(function(resolve, reject) {
      // console.info('in MapService.getCurrentPosition()');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          pos.latitude = position.coords.latitude;
          pos.longitude = position.coords.longitude;
          StorageService.set('curPos', pos);
          console.info('Original position is (' + pos.latitude + ', ' + pos.longitude + ').');

          resolve(pos);
        }, function(err) {
          console.error('MapService.getCurrentPosition() is failed.');
          console.dir(err);
          // PositionError
          // code:3
          // message:"Timeout expired"
          // __proto__:
          // PositionError
          // 	PERMISSION_DENIED:1
          // 	POSITION_UNAVAILABLE:2
          // 	TIMEOUT:3
          pos.latitude = 37.403425;
          pos.longitude = 127.105783;

          resolve(pos);
        }, {
          timeout: 5000,
          enableHighAccuracy: true,
          maximumAge: 60000
        });
      } else {
        reject('Browser doesn\'t support Geolocation');
      }
    });
  };

  function watchCurrentPosition(success, fail) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(function(position) {
        pos.latitude = position.coords.latitude;
        pos.longitude = position.coords.longitude;
        StorageService.set('curPos', pos);
        console.info('Changed position is (' + pos.latitude + ', ' + pos.longitude + ').');

        success(pos);
      }, function(err) {
        console.error('MapService.watchCurrentPosition() is failed.');
        console.dir(err);
        fail(err);
      }, {
        timeout: 5000
        // enableHighAccuracy: true
      });
    } else {
      return -1;
    }
  }

  function clearWatch() {
    if (watchID != null) {
      if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchID);
      }
    }
  }

  function getCurrentAddress(latitude, longitude, saveAddr) {
    var deferred = $q.defer();
    if (saveAddr === null || saveAddr === undefined) {
      saveAddr = true;
    }

    var geocoder = new daum.maps.services.Geocoder();
    geocoder.coord2detailaddr(
      new daum.maps.LatLng(latitude, longitude),
      function(status, result) {
        // console.dir(status);
        // console.dir(result);
        if (status === daum.maps.services.Status.OK) {
          if (result[0]) {
            console.info('Current Address is ' + result[0].jibunAddress.name + '.');
            if (saveAddr) {
              StorageService.set('addr1', result[0].roadAddress.name);
        			StorageService.set('addr2', result[0].jibunAddress.name);
        			StorageService.set('addr3', result[0].region);
            }
            deferred.resolve(result[0]);
          } else {
            console.warn('Geocoder results are not found.');
            deferred.reject(status);
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
          deferred.reject(status);
        }
      }
    );

    return deferred.promise;
  }

  return {
    getCurrentPosition: getCurrentPosition,
    getCurrentAddress: getCurrentAddress,
    watchCurrentPosition: watchCurrentPosition,
    clearWatch: clearWatch
  };
}])
.factory('CacheService', [function() {
  var data = {};

  return {
    set: function(key, value) {
      //  data[key] = value;
      return window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    get: function(key) {
      // return data[key];
      try {
        return JSON.parse(window.sessionStorage.getItem(key));
      } catch (err) {
        return null;
      }
    },
    has: function(key) {
      // return !(data[key] === undefined);
      return (window.sessionStorage.getItem(key) !== null);
    },
    remove: function(key) {
      // data[key] = undefined;
      window.sessionStorage.removeItem(key);
    }
  }
}])
.factory('StorageService', [function() {
  function get(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    } catch (err) {
      return null;
    }
  }

  function set(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    window.localStorage.removeItem(key);  }

  return {
    get: get,
    set: set,
    remove: remove
  };
}])
.factory('PKAuthStorageService', ['$cordovaFile', '$q', 'StorageService', function($cordovaFile, $q, StorageService) {
  var dicSaved = {};
  var inited = false;
  var storageFileName = 'storage.txt';

  function init() {
    var deferred = $q.defer();

    if (inited) {
      console.log('PKAuthStorageService is already inited.');
      deferred.resolve();
    } else {
      if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
        //  저장을 위한 파일이 존재하는지 확인하고, 없다면 생성해 둔다
        $cordovaFile.checkFile(cordova.file.dataDirectory, storageFileName)
        .then(function (success) {
          $cordovaFile.readAsText(cordova.file.dataDirectory, storageFileName)
          .then(function (data) {
            dicSaved = JSON.parse(data);
            inited = true;
            deferred.resolve();
          }, function (error) {
            cosole.error('Reading from the StorageFile was failed.');
            console.dir(error);

            inited = false;
            deferred.reject(error);
          });
        }, function (error) {
          console.error('StorageFile is not exist.');
          console.dir(error);

          $cordovaFile.createFile(cordova.file.dataDirectory, storageFileName, true)
          .then(function (success) {
            console.log('New StorageFile have been created.');
            inited = true;
            dicSaved = {};
            deferred.resolve();
          }, function (error) {
            console.error('Cannot create the storage file.');
            console.dir(error);
            inited = false;
            dicSaved = {};
            deferred.reject(error);
          });
        });
      } else {
        deferred.resolve();
      }
    }

    return deferred.promise;
  }

  function get(key) {
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      console.log('PKAuthStorageService.get(' + key + ') :' + dicSaved[key]);
      // $cordovaFile.readAsText(cordova.file.dataDirectory, storageFileName)
      // .then(function (data) {
      //   console.dir(data);
      // }, function (error) {
      //   cosole.error('Reading from the StorageFile was failed.');
      //   console.dir(error);
      // });

      if (dicSaved[key]) {
        return JSON.parse(dicSaved[key]);
      } else {
        return null;
      }
    } else {
      return StorageService.get(key);
    }
  }

  function set(key, value) {
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      console.log('PKAsyncStorageService.setItem(' + key + ', ' + value + ')');
      dicSaved[key] = JSON.stringify(value);
      saveToFile();
    } else {
      StorageService.set(key, value);
    }
  }

  function saveToFile() {
    //  파일 저장
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      $cordovaFile.writeFile(cordova.file.dataDirectory, storageFileName, JSON.stringify(dicSaved), true)
      .then(function (success) {
      }, function (error) {
        console.error('Writing to storage file is failed.');
        console.dir(error);
      });
    }
  }

  function remove(key) {
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      dicSaved[key] = null;
      saveToFile();
    } else {
      StorageService.remove(key);
    }
  }

  function reset() {
    inited = false;
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      $cordovaFile.removeFile(cordova.file.dataDirectory, storageFileName)
      .then(function (success) {
        console.log('Removing storage file was successed.');
      }, function (error) {
        console.error('Removing storage file was failed.');
        console.dir(error);
      });
    }
  }

  return {
    init: init,
    get: get,
    set: set,
    remove: remove,
    reset: reset
  };
}])
// .factory('UtilService', [function() {
//   return {
//     InIOSorAndroid: function(expected) {
//       var called = false;
//       if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
//         called = true;
//         expected();
//       }
//       return {
//         else : function(otherwise) {
//           if (!called) {
//             otherwise();
//           }
//         }
//       }
//     }
//   }
// }])
.factory('PhotoService', ['$cordovaCamera', '$cordovaImagePicker', '$q', function($cordovaCamera, $cordovaImagePicker, $q) {
  function getPhotoWithCamera() {
    var deferred = $q.defer();

		if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
			var options = {
	      quality: 70,
	      destinationType: Camera.DestinationType.FILE_URI,
	      sourceType: Camera.PictureSourceType.CAMERA,
	      allowEdit: false,
	      encodingType: Camera.EncodingType.JPEG,
	      targetWidth: 1280,
	      targetHeight: 1280,
	      popoverOptions: CameraPopoverOptions,
	      correctOrientation: true,
	      saveToPhotoAlbum: false
	    };

	    $cordovaCamera.getPicture(options)
	    .then(function (imageURI) {
	      console.log('imageURI: ' + imageURI);
        deferred.resolve(imageURI);
	    }, function (err) {
	      console.error('Camera capture failed : ' + err);
        deferred.reject(err);
	    });
		} else {	// test in web-browser
      deferred.resolve('img/sample/sample_01.jpg');
		}

    return deferred.promise;
	};

	function getPhotoWithPhotoLibrary(reqCount) {
    var deferred = $q.defer();

		if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
			$cordovaImagePicker.getPictures({
	      maximumImagesCount: reqCount,
	      quality: 70,
        width: 1280,
				height: 1280
	    }).
	    then(function(imageURIs) {
        deferred.resolve(imageURIs);
	    }, function (error) {
	      console.error(err);
        deferred.reject(err);
	    });
		} else {	// test in web-browser
      deferred.resolve(['img/sample/sample_02.jpg']);
		}

    return deferred.promise;
	};

  return {
    getPhotoWithCamera: getPhotoWithCamera,
    getPhotoWithPhotoLibrary: getPhotoWithPhotoLibrary
  }
}])
.factory('photoEngineService', ['$q', '$cordovaFile', function($q, $cordovaFile) {
  function getPhotoList() {
    var deferred = $q.defer();

    PhotoEngine.photoList(function(results) {
      // console.dir(results);
      // var parsed = JSON.parse(results);

      if (results.error === 0) {
        deferred.resolve(results.data.reverse());
        } else {
        deferred.reject(results.error);
      }
    });

    return deferred.promise;
  }

  function getPhoto(index) {
    var deferred = $q.defer();

    console.log('in getPhoto[' + index + ']');
    PhotoEngine.storePhoto(index, function(results) {
      // console.log('storePhoto..');
      // console.dir(results);
      if (results.error === 0) {
        // $cordovaFile.checkFile(cordova.file.documentsDirectory, index + '')
        // .then(function(success) {
        //   console.log(index + 'file is exist');
          deferred.resolve(results.data);
        // }, function(err) {
        //   console.dir(err);
        //   deferred.reject(err);
        // });
      } else {
        deferred.reject(results.data);
      }
    });

    return deferred.promise;
  }

  function deletePhoto(index) {
    var deferred = $q.defer();

    if (ionic.Platform.isAndroid()) {
      deferred.resolve();
    } else {
      $cordovaFile.removeFile(cordova.file.documentsDirectory, index + '')
      .then(function(result) {
        // console.dir(result);
        // $cordovaFile.checkFile(cordova.file.documentsDirectory, index + '')
        // .then(function(success) {
        //   console.log(index + 'file is exist');
        // }, function(err) {
        //   console.dir(err);
        // })
        // .finally(function() {
          deferred.resolve();
        // });
      }, function(err) {
        console.error(err);
        deferred.reject(err);
      });
    }

    return deferred.promise;
  }

  return {
    getPhotoList: getPhotoList,
    getPhoto: getPhoto,
    deletePhoto: deletePhoto
  };
}])
.factory('gmapService', [function(){
  function createMap(elemName, mapOption) {
    return new google.maps.Map(document.getElementById(elemName), mapOption);
  }

  function createMarker(markerOption) {
    return new google.maps.Marker(markerOption);
  }

  function createMarker2(markerOption) {
    return new google.maps.Circle({
      zIndex: markerOption.zIndex || 100,
      fillColor: markerOption.fillColor || '#2e4a94',
      fillOpacity: markerOption.fillOpacity || 0.2,
      strokeColor: markerOption.strokeColor || '#4875e9',
      strokeWeight: markerOption.strokeWeight || 2,
      strokeOpacity: markerOption.strokeOpacity || 0.9,
      radius: markerOption.radius || 30,
      center: markerOption.center,
      map: markerOption.map
    });
  }

  function deleteMarker(markerObj) {
    if (markerObj) {
      markerObj.setMap(null);
    }
    return null;
  }

  function deleteMarkers(markerObjs) {
    for (var i = 0; i < markerObjs.length; i++) {
      markerObjs[i].setMap(null);
    }
    return [];
  }

  function createInfoWindow(wndOption){
    return new google.maps.InfoWindow(wndOption);
  }

  function deleteInfoWindow(wndObj) {
    if (wndObj) {
      wndObj.close();
    }
  }

  function deleteInfoWindows(wndObjs) {
    for (var i = 0; i < wndObjs.length; i++) {
      deleteInfoWindow(wndObjs[i]);
    }
    return [];
  }

  return {
    createMap: createMap,
    createMarker: createMarker,
    createMarker2: createMarker2,
    deleteMarker: deleteMarker,
    deleteMarkers: deleteMarkers,
    createInfoWindow: createInfoWindow,
    deleteInfoWindow: deleteInfoWindow,
    deleteInfoWindows: deleteInfoWindows
  };
}])
.factory('starPointIconService', [function() {
  var starPointArray = [
    ['ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
    ['ion-ios-star-half', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star-half', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star', 'ion-ios-star-half', 'ion-ios-star-outline', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-outline', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-half', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-outline'],
    ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-half'],
    ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star']
  ];

  return {
    get : function(index) {
      index = index || 0;
      return starPointArray[index];
    }
  }
}])
.factory('DOMHelper', [function() {
  function getImageHeight(elem, cols, padding) {
    cols = cols || 3;
    padding = (padding === null) ? 5 : padding;

    if (!elem) {
      return 0;
    }

    var elems = document.getElementsByClassName(elem);
		// console.log('elems[' + elem + '].length : ' + elems.length);
    for (var i = 0; i < elems.length; i++) {
			// console.log('elems[' + elem + '].clientWidth : ' + elems[i].clientWidth);
      if (elems[i].clientWidth) {
				return parseInt((elems[i].clientWidth - (cols + 1) * padding) / cols);
      }
    }
    return 0;
  }

  return {
    getImageHeight: getImageHeight
  }
}]);
