'use strict';

angular.module('placekoob.controllers')
.controller('placeCtrl', ['$scope', '$ionicHistory', '$stateParams', '$ionicPopup', 'RemoteAPIService', 'PostHelper', function($scope, $ionicHistory, $stateParams, $ionicPopup, RemoteAPIService, PostHelper) {
  var place = this
  place.place_id = parseInt($stateParams.place_id);
  console.log('Place ID : ' + place.place_id);
  place.postHelper = PostHelper;

  RemoteAPIService.getPost(place.place_id)
  .then(function(post) {
      place.post = post;
      if (place.post.placePost)
        place.post.tags = PostHelper.getTagsFromString(place.post.placePost.notes[0].content);
  }, function(err) {
    $ionicPopup.alert({
      title: '죄송합니다!',
      template: '해당하는 장소 정보를 불러올 수 없습니다.'
    })
    .then(function() {
      $ionicHistory.goBack();
    });
  });

  place.deletePlace = function() {
    console.warn('Post delte : Not yet implemented.');
  }

  place.goBack = function() {
    console.log("Move Back");
    $ionicHistory.goBack();
  };
}]);
