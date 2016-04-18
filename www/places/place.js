'use strict';

angular.module('placekoob.controllers')
.controller('placeCtrl', ['$scope', '$ionicHistory', '$stateParams', '$ionicPopup', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicActionSheet', '$ionicScrollDelegate', 'RemoteAPIService', 'PostHelper', 'PhotoService', function($scope, $ionicHistory, $stateParams, $ionicPopup, $ionicModal, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicScrollDelegate, RemoteAPIService, PostHelper, PhotoService) {
  var place = this
  place.uplace_uuid = $stateParams.uplace_uuid;
  console.log('Place ID : ' + place.uplace_uuid);
  place.postHelper = PostHelper;
  place.zoomMin = 1;
  place.ImagesForSlide = [];

  place.loadPlaceInfo = function(force) {
    RemoteAPIService.getPost(place.uplace_uuid, force)
    .then(function(post) {
        place.post = post;
        if (place.post.userPost) {
          place.post.tags = PostHelper.getTagsWithContent(place.post.userPost.notes[0].content);
        }
        if (place.post.userPost.images) {
          place.ImagesForSlide = [];
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
    console.log('Move Back');
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
      if (Url !== undefined) {
        RemoteAPIService.sendUserPost({
          urls: [{
            content: Url
          }],
          uplace_uuid: place.uplace_uuid
        })
        .then(function(result) {
          console.log('Adding URL to the post is successed.');
          $ionicPopup.alert({
            title: 'SUCCESS',
            template: 'URL이 추가되었습니다.'
          })
          .then(function(result){
            place.loadPlaceInfo(true);
          });
        }, function(err) {
          console.error('Adding URL to the post is failed.');
          $ionicPopup.alert({
            title: 'ERROR: Add URL',
            template: JSON.stringify(err)
          });
        });
      }
    });
  };

  place.addPhoto = function() {
    $ionicActionSheet.show({
      buttons: [
        { text: '카메라로 사진 찍기' },
        { text: '사진 앨범에서 선택' }
      ],
      titleText: '사진을 추가 합니다.',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        console.log('[Event(ActionSheet:click)]Button['+ index + '] is clicked.');
        if (index == 0) {
          PhotoService.getPhotoWithCamera()
      		.then(function(imageURI) {
            RemoteAPIService.uploadImage(imageURI)
        		.then(function(response) {
        			console.log('Image UUID: ' + response.uuid);
      				RemoteAPIService.sendUserPost({
      					images: [{
      						content: response.file
      					}],
      					uplace_uuid: place.uplace_uuid
      				})
      				.then(function(result) {
      					console.log('Adding image to the post is successed.');
      					$ionicPopup.alert({
      		        title: 'SUCCESS',
      		        template: '이미지가 추가되었습니다.'
      		      })
                .then(function() {
                  place.loadPlaceInfo(true);
                });
      				}, function(err) {
      					console.error('Adding image to the post is failed.');
      					$ionicPopup.alert({
      		        title: 'ERROR: Add Image',
      		        template: JSON.stringify(err)
      		      });
      				});
        		}, function(err) {
        			$ionicPopup.alert({
                title: 'ERROR: Upload Image',
                template: JSON.stringify(err)
              });
        		});
      		});
        } else {
          PhotoService.getPhotoWithPhotoLibrary(1)
      		.then(function(imageURIs) {
            console.dir(imageURIs);
            for (var i = 0; i < imageURIs.length; i++){
              RemoteAPIService.uploadImage(imageURIs[i])
          		.then(function(response) {
          			console.log('Image UUID: ' + response.uuid);
        				RemoteAPIService.sendUserPost({
        					images: [{
        						content: response.file
        					}],
        					uplace_uuid: place.uplace_uuid
        				})
        				.then(function(result) {
        					console.log('Adding image to the post is successed.');
        					$ionicPopup.alert({
        		        title: 'SUCCESS',
        		        template: '이미지가 추가되었습니다.'
        		      })
                  .then(function() {
                    place.loadPlaceInfo(true);
                  });
        				}, function(err) {
        					console.error('Adding image to the post is failed.');
        					$ionicPopup.alert({
        		        title: 'ERROR: Add Image',
        		        template: JSON.stringify(err)
        		      });
        				});
          		}, function(err) {
          			$ionicPopup.alert({
                  title: 'ERROR: Upload Image',
                  template: JSON.stringify(err)
                });
          		});
            }
      		});
        }

        return true;
      }
    });
  };

  place.openLink = function(url) {
    window.open(url, '_system');
  };

  place.searchPlace = function() {
    var query = place.post.placePost.name.content;
    if (place.post.placePost.addrs && place.post.placePost.addrs.length > 0) {
      var regions = place.post.placePost.addrs[0].content.split(' ');
      var loopCount = regions.length >= 3 ? 3 : regions.length;
      for (var i = 0; i < loopCount; i++) {
        query += '+' + regions[i];
      }
      console.log('Calculated query : ', query);
      query = encodeURI(query);
      console.log('URL encoded query : ', query);
    }
    window.open('https://m.search.naver.com/search.naver?sm=mtb_hty.top&where=m_blog&query=' + query, '_system');
  };

  place.loadPlaceInfo();
}]);
