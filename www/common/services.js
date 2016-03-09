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

  function excute(sqlStatement, sqlParam) {
    if (!PKDB) {
      init();
    }
    return $cordovaSQLite.execute(PKDB, sqlStatement, sqlParam);
  }

  return {
    init: init,
    execute: execute,
    close: close
  };
}])
.factory('placeListService', [function(){
  var places = {
    today: [
      {
        date: new Date(),
        distance: 100,
        name: '능라',
        address: '경기도 성남시 분당구 운중동 883-1',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/51587/58817/51587_58817_80_0_8139_201554183752653_300x200.jpg',
        tag: ['평양냉면', '슴슴함', '분당최고'],
        feeling: 0
      },
      {
        date: new Date(),
        distance: 1000,
        name: '능이향기',
        address: '경기도 성남시 분당구 운중동 349-2',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/54435/54511/54435_54511_83_2_5265_201432716121355_300x200.jpg',
        tag: ['회식', '시원한국물', '닭느님'],
        feeling: 0
      }
    ],
    thisWeek: [
      {
        date: new Date().setDate(new Date().getDate() - 1),
        distance: 30000,
        name: '윌리엄스버거',
        address: '경기도 성남시 분당구 백현동 579-4',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/57861/56430/57861_56430__20204281_300x200.jpg',
        tag: ['뉴요커', '썰어먹는햄버거', '육즙줄줄', '먹기불편'],
        feeling: 1
      },
      {
        date: new Date().setDate(new Date().getDate() - 3),
        distance: 260000,
        name: '진흥반점',
        address: '대구시 남구 이천동 311-28',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/55970/54753/55970_54753__9714223_300x200.jpg',
        tag: ['5대짬뽕', '조미료작렬', '그래도맛나', '해장쵝오'],
        feeling: 0
      },
      {
        date: new Date().setDate(new Date().getDate() - 4),
        distance: 220000,
        name: '속초생대구',
        address: '강원도 속초시 영랑동 131-19',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/53291/54393/53291_54393_85_4_3181_2014116221523974_300x200.jpg',
        tag: ['해장에그만', '대구지리', '대구전도대박'],
        feeling: 0
      }
    ],
    other: [
      {
        date: new Date().setDate(new Date().getDate() - 12),
        distance: 150000,
        name: '통나무닭갈비',
        address: '강원도 춘천시 신북읍 천전리 38-26',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/56363/56830/56363_56830_80_0_9914_201582212954938_300x200.jpg',
        tag: ['줄서서먹는집'],
        feeling: 1
      },
      {
        date: new Date().setDate(new Date().getDate() - 15),
        distance: 3000,
        name: '유타로',
        address: '경기도 성남시 분당구 서현동 260-4',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/52903/55979/52903_55979__20057910_300x200.jpg',
        tag: ['라멘은진리', '쿠로라멘추천'],
        feeling: 1
      },
      {
        date: new Date().setDate(-1),
        distance: 1000,
        name: '방아깐',
        address: '경기도 성남시 분당구 판교동 603-2',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/57067/53779/57067_53779_85_4_47_2013119211058325_300x200.jpg',
        tag: ['인사불성', '꽐라로가는지름길-_-'],
        feeling: 1
      },
      {
        date: new Date().setDate(new Date().getDate() - 30),
        distance: 3000,
        name: '채선당',
        address: '경기도 성남시 분당구 판교동 625',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/52026/58158/52026_58158_85_4_471_20143452636574_300x200.jpg',
        tag: ['샵샵', '꼬기꼬기'],
        feeling: 2
      },
      {
        date: new Date().setDate(new Date().getDate() - 40),
        distance: 15000,
        name: '코지마',
        address: '서울특별시 강남구 청담동 89-17',
        img: 'https://dcimgs.s3.amazonaws.com/images/r_images/51757/57533/51757_57533_80_0_5400_2015111415316202_300x200.jpg',
        tag: ['박경제솁', '너무비싸', '지갑탈탈', '여친가오잡기'],
        feeling: 3
      }
    ]
  };

  return {
    getPlaces: function() {
      return places;
    },
    getTagString: function(tags) {
      var strTag = '';
  		for(var i = 0; i < tags.length; i++) {
  			strTag += '#' + tags[i] + ' ';
  		}
  		return strTag;
    },
    getFeeling: function(feeling) {
      switch (feeling) {
        case 0:
          return '다시 가고 싶은 곳';
        case 1:
          return '괜찮은 곳';
        case 2:
          return '별로인 곳';
        case 3:
          return '가보고 싶은 곳';
      }
    }
  }
}]);
