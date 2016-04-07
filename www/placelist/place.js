'use strict';

angular.module('placekoob.controllers')
.controller('placeCtrl', ['$scope', '$ionicHistory', function($scope, $ionicHistory) {
  var place = this;

  place.images = [
    'https://dcimgs.s3.amazonaws.com/images/r_images/51587/58817/51587_58817_80_0_8139_201554183752653_300x200.jpg',
    'https://dcimgs.s3.amazonaws.com/images/r_images/54435/54511/54435_54511_83_2_5265_201432716121355_300x200.jpg',
    'https://dcimgs.s3.amazonaws.com/images/r_images/57861/56430/57861_56430__20204281_300x200.jpg',
    'https://dcimgs.s3.amazonaws.com/images/r_images/55970/54753/55970_54753__9714223_300x200.jpg'
  ];

  place.comment = '분당 판교 지역 평양냉면집 중에는 최강자. 슴슴한 국물을 시원하게 들이키면 속이 화악 풀린다!';

  place.goBack = function() {
    console.log("Move Back");
    $ionicHistory.goBack();
  };
}]);
