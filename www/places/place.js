'use strict';

angular.module('placekoob.controllers')
.controller('placeCtrl', ['$scope', '$ionicHistory', '$stateParams', '$ionicPopup', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', 'RemoteAPIService', 'PostHelper', function($scope, $ionicHistory, $stateParams, $ionicPopup, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate, RemoteAPIService, PostHelper) {
  var place = this
  place.place_id = parseInt($stateParams.place_id);
  console.log('Place ID : ' + place.place_id);
  place.postHelper = PostHelper;
  place.zoomMin = 1;
  place.ImagesForSlide = [];

  place.loadPlaceInfo = function() {
    RemoteAPIService.getPost(place.place_id)
    .then(function(post) {
        place.post = post;
        if (place.post.placePost) {
          place.post.tags = PostHelper.getTagsWithContent(place.post.placePost.notes[0].content);
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
  }

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

  place.addUrl = function() {
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="place.Url">',
      title: '추가할 URL을 입력하세요',
      subTitle: '붙여넣기를 하시면 편리합니다.',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>확인</b>',
          type: 'pk-accent',
          onTap: function(e) {
            if (!$scope.place.Url) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.place.Url;
            }
          }
        }
      ]
    });

    myPopup.then(function(Url) {
      console.log('Tapped!', Url);
      RemoteAPIService.sendUserPost({
        urls: [{
          content: Url
        }],
        place_id: place.place_id
      })
      .then(function(result) {
        console.log("Sending user post successed.");
        $ionicPopup.alert({
          title: 'SUCCESS',
          template: 'URL이 추가로 저장되었습니다.'
        })
        .then(function(result){
          place.loadPlaceInfo();
        });
      }, function(err) {
        console.error("Sending user post failed.");
        $ionicPopup.alert({
          title: 'ERROR: Add URL',
          template: JSON.stringify(err)
        });
      });
    });
  };

  place.loadPlaceInfo();
}]);
