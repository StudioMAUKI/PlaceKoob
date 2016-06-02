'use strict';

angular.module('placekoob.controllers')
.controller('mapCtrl', ['$scope', '$ionicPopup', '$state', '$ionicScrollDelegate', '$ionicLoading', '$q', '$ionicModal', '$cordovaClipboard', 'gmapService', 'MapService', 'RemoteAPIService', 'StorageService', 'PhotoService', function($scope, $ionicPopup, $state, $ionicScrollDelegate, $ionicLoading, $q, $ionicModal, $cordovaClipboard, gmapService, MapService, RemoteAPIService, StorageService, PhotoService) {
  var map = this;
  map.prevIndex = 0;
	map.last_marker_index = -1;
	map.last_coords = StorageService.get('curPos') || { latitude: 37.5666103, longitude: 126.9783882 };
	map.lastMapCenter = {};
	map.enabled = true;
  map.mapOption = {
		center: {
      lat: map.last_coords.latitude,
      lng: map.last_coords.longitude
    },
		zoom: 15,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false
	};
  map.mapObj = gmapService.createMap('map', map.mapOption);
  map.curMarker = null;
  map.postMarkers = [];
  map.postInfoWindows = [];
	map.loadedMap = false;
	map.itemHeight = '99px';
	map.itemWidth = window.innerWidth + 'px';

  $scope.$on('$ionicView.loaded', function() {
    map.divToFit();
  });

  $scope.$on('$ionicView.afterEnter', function() {
		console.log('$ionicView.afterEnter');
		map.enabled = true;
		if (map.loadedMap) {
      console.log('map resize event triggered');
      google.maps.event.trigger(map.mapObj, 'resize');
			map.loadSavedPlace();
		} else {
			map.loadMap();
		}
	});

  $scope.$on('$ionicView.afterLeave', function() {
    console.log('$ionicView.afterLeave');
    map.enabled = false;
  });

  map.showAlert = function(title, msg) {
		return $ionicPopup.alert({ title: title, template: msg });
	};

  // 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
	map.divToFit = function() {
		var documentHeight = $(document).height();
		var barHeight = document.getElementsByTagName('ion-header-bar')[0].clientHeight || 44;
    var buttonBarHeight = document.getElementsByClassName('button-bar')[0].clientHeight || 50;
		var tabHeight = document.getElementsByClassName('tabs')[0].clientHeight || 49;
    // console.info('Document Height : ' + documentHeight);
		// console.info('Bar Height : ' + barHeight);
    // console.info('Button Bar Height : ' + buttonBarHeight);
		// console.info('Tab Height : ' + tabHeight);
		$('#map').css({
			height: documentHeight
        - barHeight
        - buttonBarHeight
        - tabHeight// 137 : height = document - bar - tab_bar
		});
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
		map.postMarkers[index].setIcon('img/icon/arrow-point-to-custom.svg');

		//	선택된 마커가 현재의 지도 안에 있는 지 확인
		if (!isMarkerContained(map.posts[index].lonLat.lat, map.posts[index].lonLat.lon)) {
      map.mapObj.setCenter({
        lat: map.posts[index].lonLat.lat,
        lng: map.posts[index].lonLat.lon
      });
		}

		//	기존의 슬라이드의 마커는 기본 상태로 되돌리고
		if (map.prevIndex < map.posts.length) {
      map.postMarkers[map.prevIndex].setIcon('img/icon/arrow-point-to-down-blue.svg');
      map.postMarkers[map.prevIndex].setZIndex(1000 + map.prevIndex);
      map.postInfoWindows[map.prevIndex].setZIndex(1000 + map.prevIndex);
			map.postMarkers[index].setZIndex(9999);
      map.postInfoWindows[index].setZIndex(9999);
		}
		//	현재 선택된 슬라이드를 저장하여, 다음의 기존 슬라이드 인덱스로 사용한다
		map.prevIndex = index;
		$scope.$digest();
	}

  map.getCurrentPosition = function() {
    var deferred = $q.defer();
		MapService.getCurrentPosition()
		.then(function(pos){
			map.getCurrentRegion(pos.latitude, pos.longitude);
			RemoteAPIService.updateCurPos(pos);
			deferred.resolve(pos);
		}, function(err) {
			deferred.reject(err);
		});

    return deferred.promise;
	};

  map.getCurrentRegion = function(latitude, longitude) {
		MapService.getCurrentAddress(latitude, longitude)
		.then(function(addrs) {
			// console.info('addr1 : ', StorageService.get('addr1') + ', ' + addrs.roadAddress.name);
			// console.info('addr2 : ', StorageService.get('addr2') + ', ' + addrs.jibunAddress.name);
			// console.info('addr3 : ', StorageService.get('addr3') + ', ' + addrs.region);
			map.address = addrs.roadAddress.name || addrs.jibunAddress.name || addrs.region || '';
		});
	};

  map.loadMap = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="lines"></ion-spinner>',
			duration: 10000
		});

		StorageService.set('addr1', '');
		StorageService.set('addr2', '');
		StorageService.set('addr3', '');

		map.getCurrentPosition()
    .then(function(pos){
      map.mapObj.setCenter({
        lat: pos.latitude,
        lng: pos.longitude
      });
			map.lastMapCenter.latitude = pos.latitude;
			map.lastMapCenter.longitude = pos.longitude;
      map.mapObj.addListener('zoom_changed', function() {
        // console.log('map: zoom_changed');
        map.loadSavedPlace();
      });
      map.mapObj.addListener('center_changed', function() {
        if (map.enabled) {
          var mapCenter = map.mapObj.getCenter();
          // console.log('map: center_changed (lat:' + mapCenter.lat() + ',lng:' + mapCenter.lng() + ')');
					var dist = parseInt(map.calculateDist(map.lastMapCenter.latitude, map.lastMapCenter.longitude, mapCenter.lat(), mapCenter.lng()));
					if (dist > 500) {
						map.lastMapCenter.latitude = mapCenter.lat();
						map.lastMapCenter.longitude = mapCenter.lng();
						map.loadSavedPlace();
					}
				}
      });

      map.curMarker = gmapService.deleteMarker(map.curMarker);
      map.curMarker = gmapService.createMarker({
        map: map.mapObj,
        position: { lat: pos.latitude, lng: pos.longitude },
        draggable: true,
        zIndex: 9999
      });
      map.curMarker.addListener('dragend', function(event) {
        console.info('marker dragend : ' + event.latLng.lat(), event.latLng.lng());
        map.mapObj.setCenter(event.latLng);
        map.getCurrentRegion(event.latLng.lat(), event.latLng.lng());
        StorageService.set('curPos', {
          latitude: event.latLng.lat(),
          longitude: event.latLng.lng()
        });
      });

      map.loadedMap = true;
      google.maps.event.trigger(map.mapObj, 'resize');
      console.log('map loaded');
      map.loadSavedPlace();
    }, function(err){
      map.showAlert('Warning!', err);
    })
		.finally(function() {
			$ionicLoading.hide();
		});
	};

  map.loadSavedPlace = function() {
    var deferred = $q.defer();
    var dist = 0;
    var bounds = map.mapObj.getBounds();
    var sw = bounds.getSouthWest();
    var mapCenter = map.mapObj.getCenter();
    dist = parseInt(map.calculateDist(mapCenter.lat(), mapCenter.lng(), mapCenter.lat(), sw.lng()));
    if (dist === 0) {
      console.warn('계산된 반경이 0으로 나왔음. 뭔가 이상한데..');
    }

    RemoteAPIService.getPostsWithPlace(mapCenter.lat(), mapCenter.lng(), dist)
    .then(function(posts) {
      map.posts = posts;
      // console.dir(map.posts);

      // markers for saved positions
      map.postMarkers = gmapService.deleteMarkers(map.postMarkers);
      map.postInfoWindows = gmapService.deleteInfoWindows(map.postInfoWindows);
      for(var i = 0; i < posts.length; i++) {
        map.posts[i].id = i;
        map.postMarkers.push(gmapService.createMarker({
          map: map.mapObj,
          position: { lat: map.posts[i].lonLat.lat, lng: map.posts[i].lonLat.lon },
          icon: (i === 0 ? 'img/icon/arrow-point-to-custom.svg' : 'img/icon/arrow-point-to-down-blue.svg'),
          draggable: false,
          zIndex: 1000 + i
        }));
        map.postMarkers[i].addListener('click', (function(i) {
            return function() {
              console.log('marker click : ' + i);
              return map.jumpToSlide(i);
            };
          })(i)
        );

        var tagsBlock = posts[i].tags.length > 0 ? '<div class="iw-content">' : '';
        for (var j = 0; j < Math.min(posts[i].tags.length, 2); j++) {
          tagsBlock += '<span class="tag">' + posts[i].tags[j] + '</span>&nbsp;'
        }
        tagsBlock += posts[i].tags.length > 0 ? '</div>' : '';
        map.postInfoWindows.push(gmapService.createInfoWindow({
          content: '<div class="iw-container">'
					    + '<div class="iw-title">' + posts[i].name + '</div>'
					    + tagsBlock
					    + '</div>',
          maxWidth: 100,
          zIndex: 1000 + i,
          disableAutoPan: true
        }));
        map.postInfoWindows[i].open(map.mapObj, map.postMarkers[i]);
        // map.posts[i].window = {
        //   zIndex: (1 === 0 ? 9999 : i),
        //   disableAutoPan: true
        // };
        // map.posts[i].windowCtrl = {};
        google.maps.event.addListener(map.postInfoWindows[i], 'domready', function() {
          var iwOuter = $('.gm-style-iw');
          var iwBackground = iwOuter.prev();

          iwBackground.children(':nth-child(2)').css({'display' : 'none'});
          iwBackground.children(':nth-child(4)').css({'display' : 'none'});

          iwOuter.parent().parent().css({left: '15px'});

          iwBackground.children(':nth-child(1)').css({'display' : 'none'});
          iwBackground.children(':nth-child(3)').css({'display' : 'none'});

          var iwCloseBtn = iwOuter.next();
          iwCloseBtn.css({'display': 'none'});
        });
      }

      map.scrollToMarker = function() {
        var scrolled_pos = $ionicScrollDelegate.$getByHandle('mapScroll').getScrollPosition().left;
        if (scrolled_pos % window.innerWidth === 0) {
          //	동일 스크롤 위치에 대한 이벤트가 연달아 두번 발생해서 처리함 (왜 그럴까..?)
          var index = scrolled_pos / window.innerWidth;
          if (map.last_marker_index !== index) {
            map.last_marker_index = index;
            window.setTimeout(function() {
              map.slidehasChanged(index);
            }, 500);
          }
        }
      };
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
		$state.go('tab.places', {uplace_uuid: uplace_uuid});
	}

  map.jumpToSlide = function(index) {
		$ionicScrollDelegate.$getByHandle('mapScroll').scrollTo(window.innerWidth * index, 0, true);
	};

  map.scrollToSavedPlace = function(uplace_uuid) {
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
    $ionicLoading.show({
			template: '<ion-spinner icon="lines"></ion-spinner>',
			duration: 60000
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
		map.selectedPlace = map.posts[index];
		$ionicModal.fromTemplateUrl('saveplace/placemodal.html', {
			scope: $scope,
			animation: 'splat'
		})
		.then(function(modal) {
			map.placeDlg = modal;
			map.placeDlg.show();
		});
	};

	map.closePlaceDlg = function() {
		map.placeDlg.hide();
		map.placeDlg.remove();
	};

	map.getImageHeight = function() {
    var images = document.getElementsByClassName('user-image');
    for (var i = 0; i < images.length; i++) {
      if (images[i].clientWidth) {
        return parseInt(images[i].clientWidth / 3);
      }
    }
    return 0;
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
	map.URL = '';

  map.savePosition = function() {
		PhotoService.getPhotoWithCamera()
		.then(function(imageURI) {
			map.attatchedImage = imageURI;
			$ionicModal.fromTemplateUrl('saveplace/saveplace.html', {
				scope: $scope,
				animation: 'slide-in-up'
			})
			.then(function(modal) {
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

  map.getCurrentPosition = function() {
		var deferred = $q.defer();
		MapService.getCurrentPosition()
		.then(function(pos){
			RemoteAPIService.updateCurPos(pos);
			MapService.getCurrentAddress(pos.latitude, pos.longitude)
			.finally(function() {
				deferred.resolve(pos);	//	주소를 얻지 못해도 정상이라고 리턴시킨다!!
			});
		}, function(err) {
			deferred.reject(err);
		});
		return deferred.promise;
	};

  map.confirmSave = function() {
		//	브라우저의 경우 테스트를 위해 분기함
		if (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid()) {
			map.attatchedImage = map.browserFile;
		}

		$ionicLoading.show({
			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
			duration: 60000
		});
		map.getCurrentPosition()
		.then(function(curPos) {
			RemoteAPIService.uploadImage(map.attatchedImage)
			.then(function(response) {
				RemoteAPIService.sendUserPost({
					lonLat: {
						lon: curPos.longitude,
						lat: curPos.latitude
					},
					notes: [{
						content: map.note
					}],
					images: [{
						content: response.file
					}],
					addr1: { content: StorageService.get('addr1') || null },
					addr2: { content: StorageService.get('addr2') || null },
					addr3: { content: StorageService.get('addr3') || null },
				})
				.then(function(result) {
					$ionicLoading.hide();
					map.closeSaveDlg();
					map.scrollToSavedPlace(result.data.uplace_uuid);
				}, function(err) {
					$ionicLoading.hide();
					map.showAlert('오류: 장소 저장', err)
					.then(function(){
						map.closeSaveDlg();
					});
				});
			}, function(err) {
				$ionicLoading.hide();
				map.showAlert('오류: 이미지 업로드', err);
			});
		}, function(err) {
			$ionicLoading.hide();
			map.showAlert('오류: 현재 위치 얻기 실패', '현재 위치를 얻어오는데 실패했습니다. 잠시후 다시 시도해 주세요.');
		});
	};

  map.confirmSaveURL = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
			duration: 60000
		});
		RemoteAPIService.sendUserPost({
			notes: [{
				content: map.note
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

  map.showFileForm = function() {
		return (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid());
	}
}]);
