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
      getUserInfoUrl: function(aspect) {
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
.factory('MapService', ['$q', function($q) {
  var pos = {};

  function getCurrentPosition() {
    return $q(function(resolve, reject) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          pos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.info('Original position is (' + pos.latitude + ', ' + pos.longitude + ').');
          resolve(pos);
        }, function() {
          pos = {
            latitude: 37.403425,
            longitude: 127.105783
          };
          resolve(pos);
        });
      } else {
        reject('Browser doesn\'t support Geolocation');
      }
    });
  };

  function getCurrentAddress(latitude, longitude) {
    var deferred = $q.defer();

    var geocoder = new daum.maps.services.Geocoder();
    geocoder.coord2detailaddr(
      new daum.maps.LatLng(latitude, longitude),
      function(status, result) {
        console.dir(status);
        console.dir(result);
        if (status === daum.maps.services.Status.OK) {
          if (result[0]) {
            console.info('Current Address is ' + result[0].jibunAddress.name + '.');
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
    getCurrentAddress: getCurrentAddress
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
      return JSON.parse(window.sessionStorage.getItem(key));
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
  function getData(key) {
    return window.localStorage.getItem(key);
  }

  function addData(key, value) {
    window.localStorage.setItem(key, value);
  }

  function removeData(key) {
    window.localStorage.removeItem(key);
  }

  return {
    getData: getData,
    addData: addData,
    removeData: removeData
  };
}])
.factory('UtilService', [function() {
  return {
    InIOSorAndroid: function(expected) {
      var called = false;
      if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
        called = true;
        expected();
      }
      return {
        else : function(otherwise) {
          if (!called) {
            otherwise();
          }
        }
      }
    }
  }
}])
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
	      console.log('imageUrl: ' + imageURI);
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
}]);
