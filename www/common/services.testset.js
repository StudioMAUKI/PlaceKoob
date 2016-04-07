'use strict';

angular.module('placekoob.services')
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
    }
  }
}])
.factory('UPostsService', ['$q', '$timeout', function($q, $timeout){
  var posts = {
    count: 15,
    next: null,
    previous: null,
    results: [
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
                place_id: 1,
                lps: [],
                lonLat: {
                    lat: 37.400142,
                    lon: 127.103119
                },
                urls: [],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
                place_id: 1,
                lps: [],
                lonLat: {
                    lat: 37.400142,
                    lon: 127.103119
                },
                urls: [],
                images: [],
                posDesc: null
            },
            vd: 2,
            place: 1
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
                place_id: 2,
                lps: [],
                lonLat: {
                    lat: 37.400142,
                    lon: 128.103119
                },
                urls: [],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
                place_id: 2,
                lps: [],
                lonLat: {
                    lat: 37.400142,
                    lon: 128.103119
                },
                urls: [],
                images: [],
                posDesc: null
            },
            vd: 2,
            place: 2
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
                place_id: 3,
                lps: [],
                lonLat: {
                    lat: 37.400142,
                    lon: 127.103119
                },
                urls: [],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
                place_id: 3,
                lps: [],
                lonLat: {
                    lat: 37.400142,
                    lon: 127.103119
                },
                urls: [],
                images: [],
                posDesc: null
            },
            vd: 2,
            place: 3
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '으흠.. 될까?',
                        uuid: '872044AD4FB75D8FB50183E4A720D084.stxt'
                    }
                ],
                place_id: 4,
                lps: [],
                lonLat: {
                    lat: 37.400273,
                    lon: 127.103297
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0C18B363C58E0D7B82FDFB17E0FF7F80.img'
                    },
                    {
                        note: null,
                        content: null,
                        uuid: 'F60D583660C03F7F74F8B0E143807F7F.img'
                    }
                ],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '으흠.. 될까?',
                        uuid: '872044AD4FB75D8FB50183E4A720D084.stxt'
                    }
                ],
                place_id: 4,
                lps: [],
                lonLat: {
                    lat: 37.400273,
                    lon: 127.103297
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0C18B363C58E0D7B82FDFB17E0FF7F80.img'
                    },
                    {
                        note: null,
                        content: null,
                        uuid: 'F60D583660C03F7F74F8B0E143807F7F.img'
                    }
                ],
                posDesc: null
            },
            vd: 33,
            place: 4
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '필드 생략하고 보내봄',
                        uuid: 'E52B9DE20134EAAA611E28E302C487BF.stxt'
                    }
                ],
                place_id: 5,
                lps: [],
                lonLat: {
                    lat: 37.400285,
                    lon: 127.103314
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0C18B363C58E0D7B82FDFB17E0FF7F80.img'
                    },
                    {
                        note: null,
                        content: null,
                        uuid: 'F60D583660C03F7F74F8B0E143807F7F.img'
                    }
                ],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '필드 생략하고 보내봄',
                        uuid: 'E52B9DE20134EAAA611E28E302C487BF.stxt'
                    }
                ],
                place_id: 5,
                lps: [],
                lonLat: {
                    lat: 37.400285,
                    lon: 127.103314
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0C18B363C58E0D7B82FDFB17E0FF7F80.img'
                    },
                    {
                        note: null,
                        content: null,
                        uuid: 'F60D583660C03F7F74F8B0E143807F7F.img'
                    }
                ],
                posDesc: null
            },
            vd: 33,
            place: 5
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '사무실. 사진 첨부해서 정식 테스트.',
                        uuid: '135BFB84480F36AC059C710E2ECCE654.stxt'
                    }
                ],
                place_id: 6,
                lps: [],
                lonLat: {
                    lat: 37.400341,
                    lon: 127.103025
                },
                urls: [],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '사무실. 사진 첨부해서 정식 테스트.',
                        uuid: '135BFB84480F36AC059C710E2ECCE654.stxt'
                    }
                ],
                place_id: 6,
                lps: [],
                lonLat: {
                    lat: 37.400341,
                    lon: 127.103025
                },
                urls: [],
                images: [],
                posDesc: null
            },
            vd: 37,
            place: 6
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '두번째',
                        uuid: '3A789377DD137CEAC67689BE2AE0B1D1.stxt'
                    }
                ],
                place_id: 7,
                lps: [],
                lonLat: {
                    lat: 37.400183,
                    lon: 127.103156
                },
                urls: [],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '두번째',
                        uuid: '3A789377DD137CEAC67689BE2AE0B1D1.stxt'
                    }
                ],
                place_id: 7,
                lps: [],
                lonLat: {
                    lat: 37.400183,
                    lon: 127.103156
                },
                urls: [],
                images: [],
                posDesc: null
            },
            vd: 37,
            place: 7
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '세번째: 시작하기',
                        uuid: 'C3521B4765B9587F1DEE42AEE6DF5A78.stxt'
                    }
                ],
                place_id: 8,
                lps: [],
                lonLat: {
                    lat: 37.400125,
                    lon: 127.103045
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: 'FFFD070A1C004081F9F3A7CF1F274CF8.img'
                    }
                ],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '세번째: 시작하기',
                        uuid: 'C3521B4765B9587F1DEE42AEE6DF5A78.stxt'
                    }
                ],
                place_id: 8,
                lps: [],
                lonLat: {
                    lat: 37.400125,
                    lon: 127.103045
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: 'FFFD070A1C004081F9F3A7CF1F274CF8.img'
                    }
                ],
                posDesc: null
            },
            vd: 37,
            place: 8
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '모래네 설렁탕',
                        uuid: '25AB4582F7C0D5E2A902C509F03D8F1C.stxt'
                    }
                ],
                place_id: 9,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'http://blog.naver.com/mardukas/220623968769',
                        uuid: 'B5CFCD94A021F47014B10AB5B6E06F7B.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '모래네 설렁탕',
                        uuid: '25AB4582F7C0D5E2A902C509F03D8F1C.stxt'
                    }
                ],
                place_id: 9,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'http://blog.naver.com/mardukas/220623968769',
                        uuid: 'B5CFCD94A021F47014B10AB5B6E06F7B.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            vd: 38,
            place: 9
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '다음 쩜 넷',
                        uuid: 'A987D4B34FF565D2ED474101632A27FD.stxt'
                    }
                ],
                place_id: 10,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'http://www.daum.net',
                        uuid: 'F35E39F61F2A91ADA7ECE08C8FF76D20.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '다음 쩜 넷',
                        uuid: 'A987D4B34FF565D2ED474101632A27FD.stxt'
                    }
                ],
                place_id: 10,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'http://www.daum.net',
                        uuid: 'F35E39F61F2A91ADA7ECE08C8FF76D20.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            vd: 37,
            place: 10
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '제이쿼리',
                        uuid: '8246B0062601C1F2693D27DA591AACBF.stxt'
                    }
                ],
                place_id: 11,
                lps: [],
                lonLat: {
                    lat: 37.400316,
                    lon: 127.103081
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'
                    }
                ],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '제이쿼리',
                        uuid: '8246B0062601C1F2693D27DA591AACBF.stxt'
                    }
                ],
                place_id: 11,
                lps: [],
                lonLat: {
                    lat: 37.400316,
                    lon: 127.103081
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'
                    }
                ],
                posDesc: null
            },
            vd: 37,
            place: 11
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '훔..',
                        uuid: '67AE375814823E478831C67877F8C3BD.stxt'
                    }
                ],
                place_id: 12,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'www.naver.com',
                        uuid: '11A2A34FAF559CBFAF9B68F0E173E3E6.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '훔..',
                        uuid: '67AE375814823E478831C67877F8C3BD.stxt'
                    }
                ],
                place_id: 12,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'www.naver.com',
                        uuid: '11A2A34FAF559CBFAF9B68F0E173E3E6.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            vd: 37,
            place: 12
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '브라우저에서 올리는거 테스트',
                        uuid: '393E4B0F55CB7D5183A4DA361807BCB6.stxt'
                    }
                ],
                place_id: 13,
                lps: [],
                lonLat: {
                    lat: 37.400276,
                    lon: 127.103274
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'
                    }
                ],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '브라우저에서 올리는거 테스트',
                        uuid: '393E4B0F55CB7D5183A4DA361807BCB6.stxt'
                    }
                ],
                place_id: 13,
                lps: [],
                lonLat: {
                    lat: 37.400276,
                    lon: 127.103274
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'
                    }
                ],
                posDesc: null
            },
            vd: 38,
            place: 13
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '울회사',
                        uuid: '3AD38881EC6AE1DA6D172FB111714339.stxt'
                    }
                ],
                place_id: 14,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'www. maukistudio.com',
                        uuid: '27F5D229515052F9EB1AFDDE78CA6DDD.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '울회사',
                        uuid: '3AD38881EC6AE1DA6D172FB111714339.stxt'
                    }
                ],
                place_id: 14,
                lps: [],
                lonLat: null,
                urls: [
                    {
                        content: 'www. maukistudio.com',
                        uuid: '27F5D229515052F9EB1AFDDE78CA6DDD.url'
                    }
                ],
                images: [],
                posDesc: null
            },
            vd: 39,
            place: 14
        },
        {
            userPost: {
                name: null,
                notes: [
                    {
                        content: '안드로이드',
                        uuid: '7E05A068BB03605A516E19B16E49D27B.stxt'
                    }
                ],
                place_id: 15,
                lps: [],
                lonLat: {
                    lat: 37.400256,
                    lon: 127.103348
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '78F0E0C182052B5670E0F8F3EFDF3F78.img'
                    }
                ],
                posDesc: null
            },
            placePost: {
                name: null,
                notes: [
                    {
                        content: '안드로이드',
                        uuid: '7E05A068BB03605A516E19B16E49D27B.stxt'
                    }
                ],
                place_id: 15,
                lps: [],
                lonLat: {
                    lat: 37.400256,
                    lon: 127.103348
                },
                urls: [],
                images: [
                    {
                        note: null,
                        content: null,
                        uuid: '78F0E0C182052B5670E0F8F3EFDF3F78.img'
                    }
                ],
                posDesc: null
            },
            vd: 39,
            place: 15
        }
    ]
};

  function getPostsOfMine(limit, offset) {
    var deferred = $q.defer();
    $timeout(function() {
      deferred.resolve(posts.results);
    }, 1000);

    return deferred.promise;
  }

  function getPostsWithPlace(lat, lon, radius) {
    var deferred = $q.defer();
    var retPosts = {
      results: [],
      count: 0
    };

    $timeout(function(){


      for (var i = 0; i < posts.results.length; i++){
        if (posts.results[i].userPost.lonLat || posts.results[i].placePost.lonLat) {
          retPosts.results.push(posts.results[i]);
          retPosts.count++;
        }
      }
      deferred.resolve(retPosts.results);
    }, 1000);

    return deferred.promise;
  }

  return {
    getPostsOfMine: getPostsOfMine,
    getPostsWithPlace: getPostsWithPlace
  };
}]);
