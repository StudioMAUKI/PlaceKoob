'use strict';

angular.module('placekoob.controllers')
.controller('mapCtrl', ['$scope', '$ionicPopup', '$state', '$stateParams', '$ionicScrollDelegate', '$ionicLoading', '$q', '$ionicModal', '$cordovaClipboard', '$ionicActionSheet', 'gmapService', 'MapService', 'RemoteAPIService', 'StorageService', 'PhotoService', 'starPointIconService', 'DOMHelper', function($scope, $ionicPopup, $state, $stateParams, $ionicScrollDelegate, $ionicLoading, $q, $ionicModal, $cordovaClipboard, $ionicActionSheet, gmapService, MapService, RemoteAPIService, StorageService, PhotoService, starPointIconService, DOMHelper) {
  var map = this;
  map.SPS = starPointIconService;
  map.prevIndex = 0;
	map.last_marker_index = -1;
	map.last_coords = StorageService.get('curPos') || { latitude: 37.5666103, longitude: 126.9783882 };
  map.initPos = StorageService.get('curPos') || { latitude: 37.5666103, longitude: 126.9783882 };
	map.lastMapCenter = {};
  map.lastZoom = 15;
	map.enabled = true;
  map.mapOption = {
    //  이 센터 값을 준다고 해서, 지도가 정확히 이 지점을 중심으로 두게끔 로딩하지 않는다
    //  왜 이지랄인지는 모르겠는데, 근처 어디쯤으로 로딩하기 때문에 정확히 위치를 잡기 위해서는
    //  다시 setCenter를 호출해야 한다. ㅆㅂ
		center: {
      lat: map.last_coords.latitude,
      lng: map.last_coords.longitude
    },
		zoom: map.lastZoom,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false
	};
  map.mapObj = gmapService.createMap('map', map.mapOption);
  google.maps.event.addListenerOnce(map.mapObj, 'idle', function() {
    console.log('Google map is fully loaded.');
    map.divToFit();
    map.loadMap();
  });
  map.curMarker = null;
  map.postMarkers = [];
	map.loadedMap = false;
	map.itemHeight = '99px';
	map.itemWidth = window.innerWidth + 'px';
  map.showInfoWindow = true;
  // map.postInfoWindows = [];
  map.tags = [];
  map.customViewMode = false;

  $scope.$on('$ionicView.afterEnter', function() {
		console.log('$ionicView.afterEnter');
		map.enabled = true;
		if (map.loadedMap) {
      console.log('map resize event triggered');
      google.maps.event.trigger(map.mapObj, 'resize');
		}
	});

  $scope.$on('$ionicView.afterLeave', function() {
    console.log('$ionicView.afterLeave');
    map.enabled = false;
  });

  $scope.$on('$ionicView.unloaded', function() {
    console.info('mapView is unloaded');
    MapService.clearWatch();
  });

  $scope.$on('map.changeCenter', function(event, lonLat) {
    console.log('map.map.changeCenter : ' + JSON.stringify(lonLat));
    map.customViewMode = true;
    setTimeout(function() {
      map.mapObj.setCenter({
        lat: lonLat.lat,
        lng: lonLat.lon
      });
      if (lonLat.radius) {
        var zoomFactor = lonLat.radius === 0 ? 0 : (Math.log(lonLat.radius / 800) / Math.LN2).toFixed(0) - 1;
        map.mapObj.setZoom(15 - zoomFactor);
      }
    }, 500);
  });

  $scope.$on('map.position.update', function(event, pos) {
    map.initPos = pos;
    RemoteAPIService.updateCurPos(pos);
    MapService.getCurrentAddress(pos.latitude, pos.longitude);
    if (map.customViewMode === false) {
      // console.info('New position info is updated.');
      if (map.curMarker) {
        map.curMarker.setPosition({
          lat: pos.latitude,
          lng: pos.longitude
        });

        map.mapObj.setCenter({
          lat: pos.latitude,
          lng: pos.longitude
        });
      }
    } else {
      console.info('New position info is updated, but current view mode is customViewMode.');
    }
  });

  map.showAlert = function(title, msg) {
		return $ionicPopup.alert({ title: title, template: msg });
	};

  // 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
	map.divToFit = function() {
    console.log('call divToFit');
		var documentHeight = $(document).height();
		var barHeight = document.getElementsByTagName('ion-header-bar')[0].clientHeight || 44;
    var buttonBarHeight = document.getElementsByClassName('button-bar')[0].clientHeight || 50;
		var tabHeight = document.getElementsByClassName('tabs')[0].clientHeight || 49;
    $('#map').css({
			height: documentHeight
        - barHeight
        - buttonBarHeight
        - tabHeight// 137 : height = document - bar - tab_bar
		});
    //  이거 꼭 해줘야 지도가 제대로 그려짐. (안그러면 걍 회색으로 나옴)
    google.maps.event.trigger(map.mapObj, 'resize');
	};


  map.getWidth = function () {
		return window.innerWidth + 'px';
  };
  map.getFullWidth = function () {
    return parseInt(window.innerWidth * document.getElementsByClassName('page').length) + 'px';
  };
  map.getHeight = function () {
    // return parseInt(document.getElementById('scroller').clientHeight - document.getElementById('header').clientHeight) + 'px';
    return '90px';
  };

  map.calculateDist = function(lat1, lon1, lat2, lon2)
	{
    function deg2rad(deg) { return (deg * Math.PI / 180); }
  	function rad2deg(rad) { return (rad * 180 / Math.PI); }

	  var dist = Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(lon1 - lon2));
	  return  Number(rad2deg(Math.acos(dist)) * 60 * 1.1515 * 1.609344 * 1000).toFixed(2);
	}

  function isMarkerContained(lat, lon) {
		var bounds = map.mapObj.getBounds();
		return bounds.contains(new google.maps.LatLng(lat,  lon));
	}

  map.slidehasChanged = function(index) {
		map.postMarkers[index].setIcon('img/icon/dot_active.svg');
    // map.postMarkers[index].setOptions({
    //   fillColor: '#FFC107',
    //   strokeColor: '#FFC107',
    //   zIndex:9999
    // });

		//	선택된 마커가 현재의 지도 안에 있는 지 확인
		if (!isMarkerContained(map.posts[index].lonLat.lat, map.posts[index].lonLat.lon)) {
      map.mapObj.setCenter({
        lat: map.posts[index].lonLat.lat,
        lng: map.posts[index].lonLat.lon
      });
		}

		//	기존의 슬라이드의 마커는 기본 상태로 되돌리고
		if (map.prevIndex < map.posts.length) {
      map.postMarkers[map.prevIndex].setIcon('img/icon/dot_normal.svg');
      // map.postMarkers[map.prevIndex].setOptions({
      //   fillColor: '#2e4a94',
      //   strokeColor: '#4875e9',
      //   zIndex: map.prevIndex
      // });
      map.postMarkers[map.prevIndex].setZIndex(map.prevIndex);
			map.postMarkers[index].setZIndex(9999);

      // map.postInfoWindows[map.prevIndex].setZIndex(map.prevIndex);
      // map.postInfoWindows[index].setZIndex(9999);
		}
		//	현재 선택된 슬라이드를 저장하여, 다음의 기존 슬라이드 인덱스로 사용한다
		map.prevIndex = index;
		$scope.$digest();
	}

  map.getCurrentPosition = function() {
		var deferred = $q.defer();
    MapService.getCurrentPosition()
		.then(function(pos){
      // console.dir(pos);
			RemoteAPIService.updateCurPos(pos);
			MapService.getCurrentAddress(pos.latitude, pos.longitude);
			deferred.resolve(pos);
		}, function(err) {
      deferred.reject(err);
		});
		return deferred.promise;
	};

  map.loadMap = function() {
    console.log('call loadMap');
    map.mapObj.setCenter({
      lat: map.initPos.latitude,
      lng: map.initPos.longitude
    });
		map.lastMapCenter.latitude = map.initPos.latitude;
		map.lastMapCenter.longitude = map.initPos.longitude;
    map.mapObj.addListener('zoom_changed', function() {
      var curZoom = map.mapObj.getZoom();
      if (map.lastZoom !== curZoom) {
        map.lastZoom = curZoom;
        console.log('zoom_changed: ' + map.lastZoom);
        map.loadSavedPlace();
      }
    });
    map.mapObj.addListener('center_changed', function() {
      if (map.enabled) {
        var mapCenter = map.mapObj.getCenter();
        var ne = map.mapObj.getBounds().getNorthEast();
        var maxDist = parseInt(map.calculateDist(mapCenter.lat(), mapCenter.lng(), mapCenter.lat(), ne.lng()));
        // console.log('Zoom_Level: ' + map.mapObj.getZoom() + ', Hor_dist: ' + maxDist);
        // console.log('map: center_changed (lat:' + mapCenter.lat() + ',lng:' + mapCenter.lng() + ')');
				var dist = parseInt(map.calculateDist(map.lastMapCenter.latitude, map.lastMapCenter.longitude, mapCenter.lat(), mapCenter.lng()));
				if (dist > maxDist * 0.7) {
					map.lastMapCenter.latitude = mapCenter.lat();
					map.lastMapCenter.longitude = mapCenter.lng();
          console.log('center_changed');
					map.loadSavedPlace();
				}
			}
    });
    map.mapObj.addListener('dragend', function() {
      console.info('map dragend event');
      map.customViewMode = true;
    });

    map.curMarker = gmapService.deleteMarker(map.curMarker);
    map.curMarker = gmapService.createMarker({
      map: map.mapObj,
      position: { lat: map.initPos.latitude, lng: map.initPos.longitude },
      draggable: true,
      zIndex: 9999
    });
    map.curMarker.addListener('dragend', function(event) {
      console.info('marker dragend : ' + event.latLng.lat(), event.latLng.lng());
      map.mapObj.setCenter(event.latLng);
      StorageService.set('curPos', {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
      });
    });

    map.loadedMap = true;
    //  resize 이벤트를 발생시키지 않으면 지도가 회색으로 나옴(why? -_-)
    google.maps.event.trigger(map.mapObj, 'resize');
    console.log('map loaded');
    map.loadSavedPlace();
	};

  map.loadSavedPlace = function() {
    var deferred = $q.defer();
    var dist = 0;
    var bounds = map.mapObj.getBounds();
    var ne = bounds.getNorthEast();
    var mapCenter = map.mapObj.getCenter();
    dist = parseInt(map.calculateDist(mapCenter.lat(), mapCenter.lng(), mapCenter.lat(), ne.lng()));
    if (dist === 0) {
      console.warn('계산된 반경이 0으로 나왔음. 뭔가 이상한데..');
    }

    RemoteAPIService.getPostsWithPlace(mapCenter.lat(), mapCenter.lng(), dist)
    .then(function(posts) {
      map.posts = posts;
      // console.dir(map.posts);

      // markers for saved positions
      map.postMarkers = gmapService.deleteMarkers(map.postMarkers);
      // map.postInfoWindows = gmapService.deleteInfoWindows(map.postInfoWindows);
      for(var i = 0; i < posts.length; i++) {
        map.posts[i].id = i;
        map.postMarkers.push(gmapService.createMarker({
          map: map.mapObj,
          position: { lat: map.posts[i].lonLat.lat, lng: map.posts[i].lonLat.lon },
          icon: (i === 0 ? 'img/icon/dot_active.svg' : 'img/icon/dot_normal.svg'),
          draggable: false,
          zIndex: (i === 0 ? 9999 : i)
        }));
        // map.postMarkers.push(gmapService.createMarker2({
        //   zIndex: (i === 0 ? 9999 : i),
        //   fillColor: (i === 0 ? '#FFC107' : null),
        //   strokeColor: (i === 0 ? '#FFC107' : null),
        //   center: { lat: map.posts[i].lonLat.lat, lng: map.posts[i].lonLat.lon },
        //   map: map.mapObj
        // }));
        map.postMarkers[i].addListener('click', (function(i) {
            return function() {
              console.log('marker click : ' + i);
              return map.jumpToSlide(i);
            };
          })(i)
        );

        // var tagsBlock = posts[i].tags.length > 0 ? '<div class="iw-content">' : '';
        // for (var j = 0; j < Math.min(posts[i].tags.length, 2); j++) {
        //   tagsBlock += '<span class="tag">' + posts[i].tags[j] + '</span>&nbsp;'
        // }
        // tagsBlock += posts[i].tags.length > 0 ? '</div>' : '';
        // map.postInfoWindows.push(gmapService.createInfoWindow({
        //   content: '<div class="iw-container">'
				// 	    + '<div class="iw-title">' + posts[i].name + '</div>'
				// 	    + tagsBlock
				// 	    + '</div>',
        //   maxWidth: 100,
        //   zIndex: 1000 + i,
        //   disableAutoPan: true
        // }));
        // map.postInfoWindows[i].open(map.mapObj, map.postMarkers[i]);
        // google.maps.event.addListener(map.postInfoWindows[i], 'domready', function() {
        //   var iwOuter = $('.gm-style-iw');
        //   var iwBackground = iwOuter.prev();
        //
        //   iwBackground.children(':nth-child(2)').css({'display' : 'none'});
        //   iwBackground.children(':nth-child(4)').css({'display' : 'none'});
        //
        //   iwOuter.parent().parent().css({left: '15px'});
        //
        //   iwBackground.children(':nth-child(1)').css({'display' : 'none'});
        //   iwBackground.children(':nth-child(3)').css({'display' : 'none'});
        //
        //   var iwCloseBtn = iwOuter.next();
        //   iwCloseBtn.css({'display': 'none'});
        // });
      }

      map.scrollToMarker = function() {
        try {
          var scrolled_pos = $ionicScrollDelegate.$getByHandle('mapScroll').getScrollPosition().left;
          if (scrolled_pos % window.innerWidth === 0) {
            //	동일 스크롤 위치에 대한 이벤트가 연달아 두번 발생해서 처리함 (왜 그럴까..?)
            var index = scrolled_pos / window.innerWidth;
            if (map.last_marker_index !== index) {
              map.last_marker_index = index;
              window.setTimeout(function() {
                map.slidehasChanged(index);
              }, 100);
            }
          }
        } catch(e) {
          console.error(e);
        }
      };

      map.prevIndex = 0;
      deferred.resolve(true);
    }, function(err) {
      console.error(err);
      deferred.reject(err);
    });

    return deferred.promise;
  };

  map.goPlace = function(uplace_uuid) {
		if (uplace_uuid === '')
			return;
		console.log('goPlace : ' + uplace_uuid);
		// $state.go('tab.places', {uplace_uuid: uplace_uuid});
    $state.go('tab.place', {uplace_uuid: uplace_uuid});
	}

  map.jumpToSlide = function(index) {
		$ionicScrollDelegate.$getByHandle('mapScroll').scrollTo(window.innerWidth * index, 0, true);
	};

  map.scrollToSavedPlace = function(uplace_uuid) {
    console.log('scrollToSavedPlace');
    map.loadSavedPlace()
		.then(function() {
			//	방금 저장한 장소로 핀과 슬라이드를 이동 시킴
			var last_uplace_id = uplace_uuid || '';
			if (last_uplace_id) {
				for (var i = 0; i < map.posts.length; i++) {
					if (last_uplace_id === map.posts[i].uplace_uuid) {
						map.jumpToSlide(i);
						break;
					}
				}
			}
		});
  };

  map.refresh = function() {
    map.customViewMode = false;
    $ionicLoading.show({
			template: '<ion-spinner icon="lines"></ion-spinner>',
			duration: 10000
		});
		map.getCurrentPosition()
    .then(function(pos){
      map.mapObj.setZoom(15);
      map.mapObj.setCenter({
        lat: pos.latitude,
        lng: pos.longitude
      });

			map.lastMapCenter.latitude = pos.latitude;
			map.lastMapCenter.longitude = pos.longitude;
      map.curMarker.setPosition({
        lat: pos.latitude,
        lng: pos.longitude
      });
    })
    .finally(function() {
      $ionicLoading.hide();
    });
    // var curpos = map.curMarker.getPosition();
    // map.curMarker.setPosition({
    //   lat: curpos.lat() + 0.0005,
    //   lng: curpos.lng() + 0.0005
    // });
    // map.mapObj.setCenter({
    //   lat: curpos.lat() + 0.0005,
    //   lng: curpos.lng() + 0.0005
    // });
  }

  map.toggleInfoWindow = function() {
    map.showInfoWindow = !map.showInfoWindow;
  }

  map.showListDlg = function() {
		$ionicModal.fromTemplateUrl('saveplace/listmodal.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
			map.listDlg = modal;
			map.listDlg.show();
		});
	};

	map.closeListDlg = function() {
		map.listDlg.hide();
		map.listDlg.remove();
	};

	map.goToPlace = function(uplace_uuid) {
		$state.go('tab.places', {uplace_uuid: uplace_uuid});
		map.closeListDlg();
	};

	map.showPlaceDlg = function(index) {
    map.closeListDlg();
    setTimeout(function() {
      map.goPlace(map.posts[index].uplace_uuid);
    }, 500);
	};

	map.closePlaceDlg = function() {
		map.placeDlg.hide();
		map.placeDlg.remove();
	};

	map.searchPlace = function() {
		var query = '';
    var region = map.selectedPlace.placePost.addr2 || map.selectedPlace.placePost.addr1 || map.selectedPlace.placePost.addr3 || null;
    console.log('Region : ' + region);
    if (region) {
      var region_items = region.content.split(' ');
      var loopCount = region_items.length >= 4 ? 4 : region_items.length;
      for (var i = 1; i < loopCount; i++) {
        query += region_items[i] + '+';
      }
    }

    query += (map.selectedPlace.placePost.name.content || map.selectedPlace.userPost.name.content);
    console.log('Calculated query : ', query);
    query = encodeURI(query);
    console.log('URL encoded query : ', query);

    window.open('https://m.search.naver.com/search.naver?sm=mtb_hty.top&where=m_blog&query=' + query, '_system');
	}

  //
  // 이하 저장 부분
  //
  map.attatchedImage = '';
  map.attatchedImages = [];
  map.calculatedHeight = DOMHelper.getImageHeight('view-container', 3, 5);
	map.URL = '';

  map.savePosition = function() {
    map.attatchedImages = [];
		PhotoService.getPhotoWithCamera()
		.then(function(imageURI) {
			map.attatchedImage = imageURI;
      map.attatchedImages.push(map.attatchedImage);
			$ionicModal.fromTemplateUrl('saveplace/saveplace.html', {
				scope: $scope,
				animation: 'slide-in-up'
			})
			.then(function(modal) {
        map.tags = [];
				map.saveDlg = modal;
				map.saveDlg.show();
			});
		}, function(err) {
      console.dir(err);
			map.showAlert('어이쿠', '저장을 위해, 현재 위치에서 사진을 찍어주세요.');
		});
	};

  map.saveURL = function() {
		$ionicModal.fromTemplateUrl('saveplace/saveurl.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
      map.tags = [];
			map.saveDlg = modal;
			map.saveDlg.show();

			if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
				$cordovaClipboard.paste()
				.then(function(result) {
					console.log('URL in clipboard: ' + result);
					var pastedURL = result;
					if (pastedURL !== '') {
						map.URL = pastedURL;
					}
				}, function(err) {
					console.error('Clipboard paste error : ' + error);
				});
			}
		})
	};

  map.closeSaveDlg = function() {
		map.saveDlg.hide();
		map.saveDlg.remove();

		map.images = [];
		map.note = '';
		map.URL = '';
	};

  map.addAttatchedImage = function() {
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
            map.attatchedImages.push(imageURI);
          }, function(err) {
            console.error(err);
          });
        } else {
          PhotoService.getPhotoWithPhotoLibrary(10)
          .then(function(imageURIs) {
            map.attatchedImages = map.attatchedImages.concat(imageURIs);
          });
        }
        return true;
      }
    });
  };

  map.deleteAttatchedImage = function(index) {
    $ionicPopup.confirm({
			title: '사진 삭제',
			template: '선택한 사진을 지우시겠습니까?'
		})
		.then(function(res){
			if (res) {
        console.log('Delete image : ' + index);
        map.attatchedImages.splice(index, 1);
      }
    });
  };

  map.confirmSave = function() {
		//	브라우저의 경우 테스트를 위해 분기함
		if (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid()) {
			map.attatchedImage = map.browserFile;
		}

		$ionicLoading.show({
			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
			duration: 30000
		});

    var tasksOfUploadingImages = [];
    for (var i = 0; i < map.attatchedImages.length; i++) {
      tasksOfUploadingImages.push(RemoteAPIService.uploadImage(map.attatchedImages[i]));
    }
    $q.all(tasksOfUploadingImages)
    .then(function(results) {
      console.log('results of upload image:', results);
      console.dir(results);

      var uploadedImages = [];
      for (var i = 0; i < results.length; i++) {
        uploadedImages.push({content: results[i].file});
      }
      var curPos = StorageService.get('curPos');
      RemoteAPIService.sendUserPost({
				lonLat: {
					lon: curPos.longitude,
					lat: curPos.latitude
				},
				notes: [{
					// content: map.note
          content: map.convertTagsToNote()
				}],
				images: uploadedImages,
				addr1: { content: StorageService.get('addr1') || null },
				addr2: { content: StorageService.get('addr2') || null },
				addr3: { content: StorageService.get('addr3') || null },
        name: { content: map.placeNameForSave || null}
			})
			.then(function(result) {
        console.dir(result);
				$ionicLoading.hide();
				map.closeSaveDlg();
				map.scrollToSavedPlace(result.data.uplace_uuid);
			}, function(err) {
				$ionicLoading.hide();
				map.showAlert('장소 저장 실패', err)
				.then(function(){
					map.closeSaveDlg();
				});
			});
    }, function(err) {
      console.error(err);
      $ionicLoading.hide();
			map.showAlert('이미지 업로드 실패', err)
      .then(function(){
        map.closeSaveDlg();
      });
    });

    // var curPos = StorageService.get('curPos');
		// RemoteAPIService.uploadImage(map.attatchedImage)
		// .then(function(response) {
    //   console.log('response file: ' + response.file);
		// 	RemoteAPIService.sendUserPost({
		// 		lonLat: {
		// 			lon: curPos.longitude,
		// 			lat: curPos.latitude
		// 		},
		// 		notes: [{
		// 			// content: map.note
    //       content: map.convertTagsToNote()
		// 		}],
		// 		images: [{
		// 			content: response.file
		// 		}],
		// 		addr1: { content: StorageService.get('addr1') || null },
		// 		addr2: { content: StorageService.get('addr2') || null },
		// 		addr3: { content: StorageService.get('addr3') || null },
    //     name: { content: map.placeNameForSave || null}
		// 	})
		// 	.then(function(result) {
    //     console.dir(result);
		// 		$ionicLoading.hide();
		// 		map.closeSaveDlg();
		// 		map.scrollToSavedPlace(result.data.uplace_uuid);
		// 	}, function(err) {
		// 		$ionicLoading.hide();
		// 		map.showAlert('장소 저장 실패', err)
		// 		.then(function(){
		// 			map.closeSaveDlg();
		// 		});
		// 	});
		// }, function(err) {
		// 	$ionicLoading.hide();
		// 	map.showAlert('이미지 업로드 실패', err);
		// });
	};

  map.confirmSaveURL = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
			duration: 60000
		});
		RemoteAPIService.sendUserPost({
			notes: [{
				// content: map.note
        content: map.convertTagsToNote()
			}],
			urls: [{
				content: map.URL
			}]
		})
		.then(function(result) {
			$ionicLoading.hide();
			map.closeSaveDlg();
			$scope.$emit('posts.request.refresh');
		}, function(err) {
			$ionicLoading.hide();
			map.showAlert('오류: URL 저장', err)
			.then(function(){
				map.closeSaveDlg();
			});
		});
	};

  map.convertTagsToNote = function() {
    return '[NOTE_TAGS]#' + JSON.stringify(map.tags);
  }

  map.showFileForm = function() {
		return (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid());
	};

  map.processTags = function($event) {
    //console.dir($event);
    var space = 32;
    var enter = 13;
    var comma = 188;
    if ($event.keyCode === space || $event.keyCode === enter || $event.keyCode === comma) {
      if (map.tag.length > 0) {
        map.tags.push(map.tag);
      } else {
        console.warn('입력 받은 태그의 길이가 0임.');
      }
      map.tag = '';
    }
  };
}]);
