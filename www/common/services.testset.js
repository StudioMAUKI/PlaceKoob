'use strict';

angular.module('placekoob.services')
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
