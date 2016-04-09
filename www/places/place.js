'use strict';

angular.module('placekoob.controllers')
.controller('placeCtrl', ['$scope', '$ionicHistory', '$stateParams', '$ionicPopup', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', 'RemoteAPIService', 'PostHelper', function($scope, $ionicHistory, $stateParams, $ionicPopup, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate, RemoteAPIService, PostHelper) {
  var place = this
  place.place_id = parseInt($stateParams.place_id);
  console.log('Place ID : ' + place.place_id);
  place.postHelper = PostHelper;
  place.zoomMin = 1;
  place.ImagesForSlide = [];

  RemoteAPIService.getPost(place.place_id)
  .then(function(post) {
      place.post = post;
      if (place.post.placePost) {
        place.post.tags = PostHelper.getTagsFromString(place.post.placePost.notes[0].content);
      }
      if (place.post.userPost.images) {
        for (var i = 0; i < place.post.userPost.images.length; i++) {
            place.ImagesForSlide.push(place.post.userPost.images[i].content);
        }
      }
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

  place.showImagesWithFullScreen = function(index) {
    place.activeSlide = index;
    place.showModal('places/image-zoomview.html');
  }

  place.showModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function(modal) {
      place.modal = modal;
      place.modal.show();
    });
  }

  place.closeModal = function() {
    place.modal.hide();
    place.modal.remove()
  };

  place.updateSlideStatus = function(slide) {
    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
    if (zoomFactor == place.zoomMin) {
      $ionicSlideBoxDelegate.enableSlide(true);
    } else {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
  };
}]);
