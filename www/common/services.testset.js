'use strict';

angular.module('placekoob.services')
.factory('DummyRemoteAPIService', ['$q', '$timeout', function($q, $timeout){
  var posts = {
    count: 15,
    next: null,
    previous: null,
    results: [
        {
            userPost: {
                uplace_uuid: 1,
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
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
                uplace_uuid: 2,
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
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
                uplace_uuid: 3,
                name: null,
                notes: [
                    {
                        content: '여기가 어디지?',
                        uuid: 'BF09F3011EB56C57D0F1F612E8CF1274.stxt'
                    }
                ],
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
                uplace_uuid: 4,
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
                uplace_uuid: 4,
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
                uplace_uuid: 5,
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
                uplace_uuid: 5,
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
                uplace_uuid: 6,
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
                uplace_uuid: 6,
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
                uplace_uuid: 7,
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
                uplace_uuid: 7,
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
                uplace_uuid: 8,
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
                uplace_uuid: 8,
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
                uplace_uuid: 9,
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
                uplace_uuid: 9,
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
                uplace_uuid: 10,
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
                uplace_uuid: 10,
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
                uplace_uuid: 11,
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
                uplace_uuid: 11,
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
        }
    ]
};

  function getPostsOfMine(position) {
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
