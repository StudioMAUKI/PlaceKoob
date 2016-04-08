'use strict';

angular.module('placekoob.controllers')
.controller('placeCtrl', ['$scope', '$ionicHistory', '$stateParams', '$ionicPopup', 'RemoteAPIService', 'PostHelper', function($scope, $ionicHistory, $stateParams, $ionicPopup, RemoteAPIService, PostHelper) {
  var place = this
  place.place_id = parseInt($stateParams.place_id);
  console.log('Place ID : ' + place.place_id);
  RemoteAPIService.getPost(place.place_id)
  .then(function(post) {
      place.post = post;
      if (place.post.placePost)
        place.post.tags = PostHelper.getTagsFromString(place.post.placePost.notes[0].content);
  }, function(err) {
    $ionicPopup.alert({
      title: 'ERROR',
      template: err
    })
    .then(function() {
      $ionicHistory.goBack();
    });
  });

  // place.post = {
  //   userPost: {
  //     name: null,
  //     notes: [{
  //       content: '오늘 저녁',
  //       timestamp: 1460108050939,
  //       uuid: '7711D424F00D571A612ADE02A970FC4D.stxt'
  //     }],
  //     place_id: 43,
  //     lps: [],
  //     phone: null,
  //     lonLat: {
  //       lat: 37.400294,
  //       timestamp: 1460108050939,
  //       lon: 127.10329
  //     },
  //     addrs: [{
  //       content: '테스트 주소(경기도 성남시 분당구 삼평동)',
  //       timestamp: 1460108050938,
  //       uuid: 'E9194769720F3B7CB80EA572770AE9E5.stxt'
  //     }],
  //     urls: [],
  //     images: [{
  //       note: null,
  //       timestamp: 1460108050939,
  //       content: '/media/images/2016/04/08/image_cSiMxbm.jpg',
  //       uuid: '03069839F264FC9F046DD87520C4933F.img'
  //     }],
  //     posDesc: null
  //   },
  //   placePost: {
  //     name: null,
  //     notes: [{
  //       content: '오늘 저녁 #판교맛집 #물냉면 #온반 #요새냉면왜이리비싸',
  //       timestamp: 1460108050939,
  //       uuid: '7711D424F00D571A612ADE02A970FC4D.stxt'
  //     }],
  //     place_id: 43,
  //     lps: [],
  //     phone: '010-8430-4463',
  //     lonLat: {
  //       lat: 37.400294,
  //       timestamp: 1460108050939,
  //       lon: 127.10329
  //     },
  //     addrs: [{
  //       content: '테스트 주소(경기도 성남시 분당구 삼평동)',
  //       timestamp: 1460108050938,
  //       uuid: 'E9194769720F3B7CB80EA572770AE9E5.stxt'
  //     }],
  //     urls: [],
  //     images: [{
  //       note: null,
  //       timestamp: 1460108050939,
  //       content: '/media/images/2016/04/08/image_cSiMxbm.jpg',
  //       uuid: '03069839F264FC9F046DD87520C4933F.img'
  //     }],
  //     posDesc: null
  //   },
  //   place_id: 43,
  //   created: 1460108050970,
  //   modified: 1460108050970
  // };


  place.goBack = function() {
    console.log("Move Back");
    $ionicHistory.goBack();
  };
}]);
