'use strict';

angular.module('placekoob.services', [])
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
.factory('PKQueries', [function() {
  return {
    USERS_CREATE: 'CREATE TABLE IF NOT EXISTS Users(' +
      'user_id INTEGER PRIMARY KEY ASC AUTOINCREMENT,' +
      'confirmed INTEGER,' +
      'token TEXT,' +
      'email TEXT' +
      ')',
    USERS_DROP: 'DROP TABLE IF EXISTS Users'
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

  return {
    getCurrentPosition: getCurrentPosition
  };
}]);
