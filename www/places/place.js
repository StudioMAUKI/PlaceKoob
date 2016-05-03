'use strict';

angular.module('placekoob.controllers')
.controller('placeCtrl', ['$scope', '$ionicHistory', '$stateParams', '$ionicPopup', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicActionSheet', '$ionicScrollDelegate', '$ionicLoading', '$q', '$cordovaClipboard', 'RemoteAPIService', 'PostHelper', 'PhotoService', function($scope, $ionicHistory, $stateParams, $ionicPopup, $ionicModal, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicScrollDelegate, $ionicLoading, $q, $cordovaClipboard, RemoteAPIService, PostHelper, PhotoService) {
  var place = this
  place.uplace_uuid = $stateParams.uplace_uuid;
  place.postHelper = PostHelper;
  place.zoomMin = 1;
  place.ImagesForSlide = [];

  place.loadPlaceInfo = function() {
    RemoteAPIService.getPost(place.uplace_uuid)
    .then(function(post) {
        place.post = post;
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
    RemoteAPIService.deleteUserPost(place.uplace_uuid)
    .then(function() {
      $ionicPopup.alert({
        title: '성공',
        template: '삭제되었습니다'
      })
      .then(function() {
        $ionicHistory.goBack();
      });
    }, function(err) {
      console.error(err);
    });
  }

  place.goBack = function() {
    console.log('Move Back');
    $ionicHistory.goBack();
  };

  place.showImagesWithFullScreen = function(index) {
    place.activeSlide = index;
    place.showModal('places/image-zoomview.html');
  }

  place.showModal = function(templateURL) {
    $ionicModal.fromTemplateUrl(templateURL, {
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

  place.addURL= function() {
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="place.URL">',
      title: '추가할 URL을 입력하세요',
      subTitle: '붙여넣기를 하시면 편리합니다.',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>확인</b>',
          type: 'pk-accent',
          onTap: function(e) {
            if (!$scope.place.URL) {
              e.preventDefault();
            } else {
              return $scope.place.URL;
            }
          }
        }
      ]
    });
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      $cordovaClipboard.paste()
      .then(function(result) {
        console.log('URL in clipboard: ' + result);
        var pastedURL = result;
        if (pastedURL !== '') {
          place.URL = pastedURL;
        }
      }, function(err) {
        console.error('Clipboard paste error : ' + error);
      });
    }

    myPopup.then(function(URL) {
      console.log('Tapped!', URL);
      if (URL !== undefined) {
        RemoteAPIService.sendUserPost({
          urls: [{
            content: URL
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
            place.loadPlaceInfo();
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
            $ionicLoading.show({
        			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
        			duration: 60000
        		});
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
      					$ionicLoading.hide();
                place.loadPlaceInfo();
      				}, function(err) {
                $ionicLoading.hide();
      					$ionicPopup.alert({
      		        title: 'ERROR: Send user post',
      		        template: JSON.stringify(err)
      		      });
      				});
        		}, function(err) {
              $ionicLoading.hide();
        			$ionicPopup.alert({
                title: 'ERROR: Upload Image',
                template: JSON.stringify(err)
              });
        		});
      		});
        } else {
          PhotoService.getPhotoWithPhotoLibrary(5)
      		.then(function(imageURIs) {
            console.dir(imageURIs);
            for (var i = 0; i < imageURIs.length; i++){
              $ionicLoading.show({
          			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
          			duration: 60000
          		});
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
                  place.loadPlaceInfo();
                  $ionicLoading.hide();
        				}, function(err) {
                  $ionicLoading.hide();
        					$ionicPopup.alert({
        		        title: 'ERROR: Send user post',
        		        template: JSON.stringify(err)
        		      });
        				});
          		}, function(err) {
                $ionicLoading.hide();
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
    var query = '';
    var region = place.post.placePost.addr2 || place.post.placePost.addr1 || place.post.placePost.addr3 || null;
    console.log('Region : ' + region);
    if (region) {
      var region_items = region.content.split(' ');
      var loopCount = region_items.length >= 4 ? 4 : region_items.length;
      for (var i = 1; i < loopCount; i++) {
        query += region_items[i] + '+';
      }
    }

    query += (place.post.placePost.name.content || place.post.userPost.name.content);
    console.log('Calculated query : ', query);
    query = encodeURI(query);
    console.log('URL encoded query : ', query);
    
    window.open('https://m.search.naver.com/search.naver?sm=mtb_hty.top&where=m_blog&query=' + query, '_system');
  };

  place.loadPlaceInfo();
}]);
