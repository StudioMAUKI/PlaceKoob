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
.factory('RemoteAPIService', ['$http', 'RESTServer', function($http, RESTServer){
  var ServerUrl = RESTServer.getURL();

  function registerUser(success, error) {
    $http({
      method: 'POST',
      url: ServerUrl + '/users/register/'
    })
    .then(function(result) {
      success(result.data.auth_user_token);
    }, function(err) {
      error(err);
    });
  }
  return {
    registerUser: registerUser
  }
}])
.factory('PlaceManager', ['UUIDGenerator', 'PKDBManager', 'PKQueries', function(UUIDGenerator, PKDBManager, PKQueries) {
  return {
    saveCurrentPlace: function(place) {
      var placeKey;
      var imageCount = 0;
      var tags = [];
      var hasCoords = false;

      // 선행 조건들 우선 체크: 1. 이미지가 첨부되어 있는가, 2. 좌표 정보가 있는가
      if( place.images && place.images.length > 0) {
        imageCount = place.images.length;
      } else {
        console.error('To save place, you MUST attatch image(s).');
        return { result: false };
      }
      if(place.coords === undefined || place.coords.latitude === undefined  || place.coords.longitude === undefined ) {
        console.error('To save place, you MUST have coordinations of current position.');
        return { result: false };
      } else {
        hasCoords = true;
      }

      if (place.note && place.note !== '' && place.note.length != 0) {
        var words = place.note.split(' ');
        for (var i = 0; i < words.length; i++) {
          if (words[i].startsWith('#')) {
            tags.push(words[i]);
          }
        }
      }
      placeKey = UUIDGenerator.getUUID();

      return {
        result: true,
        placeKey: placeKey,
        imageCount: imageCount,
        tagCount: tags.length,
        hasCoords: hasCoords,
        promise: PKDBManager.execute(PKQueries.place.create, [placeKey, place.note, JSON.stringify(place.images), JSON.stringify(place.coords)])
      }
    }
  };
}])

.factory('placeListService', [function(){
  var places = [
    {
      date: new Date(),
      distance: 100,
      name: '능라',
      placeId: '0',
      type: 1,
      address: '경기도 성남시 분당구 운중동 883-1',
      coords: {
        latitude: 37.3919496,
        longitude: 127.0560969
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/51587/58817/51587_58817_80_0_8139_201554183752653_300x200.jpg'],
      tag: ['평양냉면', '슴슴함', '분당최고'],
      feeling: 0
    },
    {
      date: new Date(),
      distance: 1000,
      name: '능이향기',
      placeId: '1',
      type: 1,
      address: '경기도 성남시 분당구 운중동 349-2',
      coords: {
        latitude: 37.3917223,
        longitude: 127.0495937
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/54435/54511/54435_54511_83_2_5265_201432716121355_300x200.jpg'],
      tag: ['회식', '시원한국물', '닭느님'],
      feeling: 0
    },
    {
      date: new Date().setDate(new Date().getDate() - 1),
      distance: 30000,
      name: '윌리엄스버거',
      placeId: '2',
      type: 1,
      address: '경기도 성남시 분당구 백현동 579-4',
      coords: {
        latitude: 37.3849686,
        longitude: 127.1033942
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/57861/56430/57861_56430__20204281_300x200.jpg'],
      tag: ['뉴요커', '썰어먹는햄버거', '육즙줄줄', '먹기불편'],
      feeling: 1
    },
    {
      date: new Date().setDate(new Date().getDate() - 3),
      distance: 260000,
      name: '진흥반점',
      placeId: '3',
      type: 2,
      address: '대구시 남구 이천동 311-28',
      coords: {
        latitude: 35.8548306,
        longitude: 128.5917691
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/55970/54753/55970_54753__9714223_300x200.jpg'],
      tag: ['5대짬뽕', '조미료작렬', '그래도맛나', '해장쵝오'],
      feeling: 0
    },
    {
      date: new Date().setDate(new Date().getDate() - 4),
      distance: 220000,
      name: '속초생대구',
      placeId: '4',
      type: 2,
      address: '강원도 속초시 영랑동 131-19',
      coords: {
        latitude: 38.2146963,
        longitude: 128.5873885
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/53291/54393/53291_54393_85_4_3181_2014116221523974_300x200.jpg'],
      tag: ['해장에그만', '대구지리', '대구전도대박'],
      feeling: 0
    },
    {
      date: new Date().setDate(new Date().getDate() - 12),
      distance: 150000,
      name: '통나무닭갈비',
      placeId: '5',
      type: 2,
      address: '강원도 춘천시 신북읍 천전리 38-26',
      coords: {
        latitude: 37.9331144,
        longitude: 127.7846136
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/56363/56830/56363_56830_80_0_9914_201582212954938_300x200.jpg'],
      tag: ['줄서서먹는집'],
      feeling: 1
    },
    {
      date: new Date().setDate(new Date().getDate() - 15),
      distance: 3000,
      name: '유타로',
      placeId: '6',
      type: 3,
      address: '경기도 성남시 분당구 서현동 260-4',
      coords: {
        latitude: 37.3865848,
        longitude: 127.1133611
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/52903/55979/52903_55979__20057910_300x200.jpg'],
      tag: ['라멘은진리', '쿠로라멘추천'],
      feeling: 1
    },
    {
      date: new Date().setDate(-1),
      distance: 1000,
      name: '방아깐',
      placeId: '7',
      type: 3,
      address: '경기도 성남시 분당구 판교동 603-2',
      coords: {
        latitude: 37.3902692,
        longitude: 127.0837552
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/57067/53779/57067_53779_85_4_47_2013119211058325_300x200.jpg'],
      tag: ['인사불성', '꽐라로가는지름길-_-'],
      feeling: 1
    },
    {
      date: new Date().setDate(new Date().getDate() - 30),
      distance: 3000,
      name: '채선당',
      placeId: '8',
      type: 3,
      address: '경기도 성남시 분당구 판교동 625',
      coords: {
        latitude: 37.3891906,
        longitude: 127.0809405
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/52026/58158/52026_58158_85_4_471_20143452636574_300x200.jpg'],
      tag: ['샵샵', '꼬기꼬기'],
      feeling: 2
    },
    {
      date: new Date().setDate(new Date().getDate() - 40),
      distance: 15000,
      name: '코지마',
      placeId: '9',
      type: 3,
      address: '서울특별시 강남구 청담동 89-17',
      coords: {
        latitude: 37.5257581,
        longitude: 127.0332266
      },
      images: ['https://dcimgs.s3.amazonaws.com/images/r_images/51757/57533/51757_57533_80_0_5400_2015111415316202_300x200.jpg'],
      tag: ['박경재솁', '너무비싸', '지갑탈탈', '여친가오잡기'],
      feeling: 3
    }
  ];

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
