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

  function getCurrentAddress(){
    return '경기도 성남시 분당구 삼평동';
  }

  return {
    getCurrentPosition: getCurrentPosition,
    getCurrentAddress: getCurrentAddress
  };
}])
.factory('CacheService', [function() {
  var data = {};

  return {
    add: function(key, value) {
      data[key] = value;
    },
    get: function(key) {
      return data[key];
    },
    has: function(key) {
      return !(data[key] === undefined);
    },
    remove: function(key) {
      data[key] = undefined;
    }
  }
}]);
