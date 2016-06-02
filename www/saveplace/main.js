'use strict';

angular.module('placekoob.controllers')
.controller('mainCtrl', ['$scope', '$ionicPopup', '$state', '$ionicScrollDelegate', '$ionicLoading', '$q', '$ionicModal', 'uiGmapGoogleMapApi', 'MapService', 'RemoteAPIService', 'StorageService', 'PostHelper', 'uiGmapIsReady', function($scope, $ionicPopup, $state, $ionicScrollDelegate, $ionicLoading, $q, $ionicModal,  uiGmapGoogleMapApi, MapService, RemoteAPIService, StorageService, PostHelper, uiGmapIsReady) {
	var main = this;
	main.prevIndex = 0;
	main.last_marker_index = -1;
	main.needToUpdateCurMarker = false;
	main.last_coords = StorageService.get('curPos') || { latitude: 37.5666103, longitude: 126.9783882 };
	main.lastMapCenter = {};
	main.enabled = true;
	main.map = {
		center: main.last_coords,
		events: {
			zoom_changed: function(map, event, args){},
			center_changed: function(map, event, args) {}
		},
		zoom: 15,
		options: {
			zoomControl: false,
			mapTypeControl: false,
			streetViewControl: false
		}
	};
	main.mapCtrl = {};
	main.curMarker = {};
	main.loadedMap = false;
	main.itemHeight = '99px';
	main.itemWidth = window.innerWidth + 'px';

	main.getWidth = function () {
		return window.innerWidth + 'px';
  };
  main.getFullWidth = function () {
    return parseInt(window.innerWidth * document.getElementsByClassName('page').length) + 'px';
  };
  main.getHeight = function () {
    // return parseInt(document.getElementById('scroller').clientHeight - document.getElementById('header').clientHeight) + 'px';
    return '90px';
  };

	function isMarkerContained(lat, lon) {
		try{
			var bounds = main.mapCtrl.getGMap().getBounds();
			var ne = bounds.getNorthEast();
			var sw = bounds.getSouthWest();
			var latMin = Math.min(ne.lat(), sw.lat());
			var latMax = Math.max(ne.lat(), sw.lat());
			var lonMin = Math.min(ne.lng(), sw.lng());
			var lonMax = Math.max(ne.lng(), sw.lng());

			if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) {
				return true;
			} else {
				return false;
			}
		} catch (e) {
			console.error('isMarkerContained : ' + e);
			return false;
		}
	}

	main.slidehasChanged = function(index) {
		try{
			main.posts[index].marker.icon = 'img/icon/arrow-point-to-custom.svg';

			//	선택된 마커가 현재의 지도 안에 있는 지 확인
			if (!isMarkerContained(main.posts[index].coords.latitude, main.posts[index].coords.longitude)) {
				main.map.center.latitude = main.posts[index].coords.latitude;
				main.map.center.longitude = main.posts[index].coords.longitude;
			}

			//	기존의 슬라이드의 마커는 기본 상태로 되돌리고
			if (main.prevIndex < main.posts.length) {
				main.posts[main.prevIndex].marker.icon = 'img/icon/arrow-point-to-down-blue.svg';
				main.posts[main.prevIndex].marker.zIndex = main.prevIndex;
				main.posts[main.prevIndex].window.zIndex = main.prevIndex;
				main.posts[index].marker.zIndex = 9999;
				main.posts[index].window.zIndex = 9999;
			}
			//	현재 선택된 슬라이드를 저장하여, 다음의 기존 슬라이드 인덱스로 사용한다
			main.prevIndex = index;
			$scope.$digest();
		} catch (err) {
			console.error(err);
		}
	}

	main.getCurrentPosition = function() {
		var deferred = $q.defer();
		// console.log('getCurrentPosition called..');
		MapService.getCurrentPosition()
		.then(function(pos){
			main.getCurrentRegion(pos.latitude, pos.longitude);
			RemoteAPIService.updateCurPos(pos);
			// console.log('getCurrentPosition called.. then');
			deferred.resolve(pos);
		}, function(err) {
			deferred.reject(err);
			// console.log('getCurrentPosition called.. error');
		});
		return deferred.promise;
	};

	main.getCurrentRegion = function(latitude, longitude) {
		MapService.getCurrentAddress(latitude, longitude)
		.then(function(addrs) {
			// console.info('addr1 : ', StorageService.get('addr1') + ', ' + addrs.roadAddress.name);
			// console.info('addr2 : ', StorageService.get('addr2') + ', ' + addrs.jibunAddress.name);
			// console.info('addr3 : ', StorageService.get('addr3') + ', ' + addrs.region);
			main.address = addrs.roadAddress.name || addrs.jibunAddress.name || addrs.region || '';
		});
	};

	// 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
	main.divToFit = function() {
		var documentHeight = $(document).height();
		var barHeight = document.getElementsByTagName('ion-header-bar')[0].clientHeight || 44;
		var tabHeight = document.getElementsByClassName('tabs')[0].clientHeight || 49;
		console.info('Document Height : ' + documentHeight);
		console.info('Bar Height : ' + barHeight);
		console.info('Tab Height : ' + tabHeight);
		$('.angular-google-map-container').css({
			height: documentHeight - barHeight - tabHeight	// 137 : height = document - bar - tab_bar
		});
	};
	main.divToFit();

	main.loadMap = function() {
		uiGmapIsReady.promise().then(function(instances) {
			uiGmapGoogleMapApi.then(function(maps) {
				$ionicLoading.show({
					template: '<ion-spinner icon="lines"></ion-spinner>',
					duration: 10000
				});

				StorageService.set('addr1', '');
				StorageService.set('addr2', '');
				StorageService.set('addr3', '');

				var result = false;
				main.getCurrentPosition()
		    .then(function(pos){
					main.map.center.latitude = pos.latitude;
					main.map.center.longitude = pos.longitude;
					main.lastMapCenter.latitude = pos.latitude;
					main.lastMapCenter.longitude = pos.longitude;
					main.map.events.zoom_changed = function(map, event, args) {
						main.loadSavedPlace();
					};
					main.map.events.center_changed = function(map, event, args) {
						if (main.enabled) {
							var dist = parseInt(PostHelper.calcDistance(main.lastMapCenter.latitude, main.lastMapCenter.longitude, main.map.center.latitude, main.map.center.longitude));
							if (dist > 500) {
								main.lastMapCenter.latitude = main.map.center.latitude;
								main.lastMapCenter.longitude = main.map.center.longitude;
								main.loadSavedPlace();
							}
						}
					};
					result = true;
		    }, function(err){
					result = false;
		      $ionicPopup.alert({ title: 'Warning!', template: err });
		    })
				.finally(function() {
					main.loadedMap = true;
					$ionicLoading.hide();
					// console.log('main.loadMap finally');
					if (result) {
						//	지도가 채 초기화 되기전에 장소를 로딩하는 느낌이 있어서, 약간의 지연을 둬봄
						// setTimeout(function() {
							main.loadSavedPlace();
						// }, 1300);
					}
				});
		  });
    });
	};

	main.loadSavedPlace = function() {
		var deferred = $q.defer();
		console.log('loadSavedPlace..');
		var dist = 0;
		try {
			var bounds = main.mapCtrl.getGMap().getBounds();
			var sw = bounds.getSouthWest();
			dist = parseInt(PostHelper.calcDistance(main.map.center.latitude, main.map.center.longitude, main.map.center.latitude, sw.lng()));
			if (dist === 0) {
				console.warn('계산된 반경이 0으로 나왔음. 뭔가 이상한데..');
			}
		} catch (e) {
			console.error('loadSavedPlace.getBounds : ' + e);
			dist = 950;
		}


		// console.log('loadSavedPlace: getPostsWithPlace before call..');
		RemoteAPIService.getPostsWithPlace(main.map.center.latitude, main.map.center.longitude, dist)
		.then(function(posts) {
			// console.log('loadSavedPlace: getPostsWithPlace');
			//	현재 위치에 대한 post를 먼저 작성하고, 얻어온 포스트 배열을 뒤에 추가한다
			var pos = StorageService.get('curPos');
			main.curMarker = {
				id: 'curMarker',
				coords: {
					latitude: pos.latitude,
					longitude: pos.longitude
				},
				options: {
					draggable: true,
					// icon: 'img/icon/pin_current.svg',
					// animation: google.maps.Animation.DROP,
					zIndex: 9999,
					events: {
						dragend: function (marker, eventName, args) {
							main.map.center.latitude = marker.position.lat();
							main.map.center.longitude = marker.position.lng();
							main.getCurrentRegion(main.map.center.latitude, main.map.center.longitude);
							StorageService.set('curPos', main.map.center);
						}
					}
				}
			};
			main.posts = posts;
			// console.dir(main.posts);

			// markers for saved positions
			for(var i = 0; i < posts.length; i++) {
				main.posts[i].id = i;
				main.posts[i].marker = {
					draggable: false,
					icon: (i === 0 ? 'img/icon/arrow-point-to-custom.svg' : 'img/icon/arrow-point-to-down-blue.svg'),
					// animation: google.maps.Animation.DROP,
					zIndex: (i === 0 ? 9999 : i),
					events: {
	          click: function(marker, eventName, args) {
							console.dir(marker);
							main.jumpToSlide(marker.key);
						}
	        }
				};
				main.posts[i].coords = {
					latitude: main.posts[i].lonLat.lat,
					longitude: main.posts[i].lonLat.lon
				};
				main.posts[i].window = {
					zIndex: (1 === 0 ? 9999 : i),
					disableAutoPan: true
				};
				main.posts[i].windowCtrl = {};
			}

			setTimeout(function() {
				var iwOuter = $('.gm-style-iw');
				var iwBackground = iwOuter.prev();

				iwBackground.children(':nth-child(2)').css({'display' : 'none'});
				iwBackground.children(':nth-child(4)').css({'display' : 'none'});

				// iwOuter.parent().parent().css({left: '115px'});

				iwBackground.children(':nth-child(1)').css({'display' : 'none'});
				iwBackground.children(':nth-child(3)').css({'display' : 'none'});

				var iwCloseBtn = iwOuter.next();
				iwCloseBtn.css({'display': 'none'});
			}, 100);

			main.scrollToMarker = function() {
				var scrolled_pos = $ionicScrollDelegate.$getByHandle('mapScroll').getScrollPosition().left;
				if (scrolled_pos % window.innerWidth === 0) {
					//	동일 스크롤 위치에 대한 이벤트가 연달아 두번 발생해서 처리함 (왜 그럴까..?)
					var index = scrolled_pos / window.innerWidth;
					if (main.last_marker_index !== index) {
						main.last_marker_index = index;
						window.setTimeout(function() {
							main.slidehasChanged(index);
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

	main.goPlace = function(uplace_uuid) {
		if (uplace_uuid === '')
			return;
		console.log('goPlace : ' + uplace_uuid);
		$state.go('tab.places', {uplace_uuid: uplace_uuid});
	}

	main.jumpToSlide = function(index) {
		$ionicScrollDelegate.$getByHandle('mapScroll').scrollTo(window.innerWidth * index,0, true);
	};

	$scope.$on('posts.request.refresh', function() {
		main.loadSavedPlace()
		.then(function() {
			//	방금 저장한 장소로 핀과 슬라이드를 이동 시킴
			var last_uplace_id = StorageService.get('last_uplace_id') || '';
			if (last_uplace_id) {
				for (var i = 0; i < main.posts.length; i++) {
					if (last_uplace_id === main.posts[i].uplace_uuid) {
						main.jumpToSlide(i);
						break;
					}
				}
			}
		});
	});

	$scope.$on('map.request.gotocurrent.after', function() {
		main.jumpToSlide(0);
		main.map.center.latitude = main.posts[0].coords.latitude;
		main.map.center.longitude = main.posts[0].coords.longitude;
	});

	$scope.$on('map.request.refresh.after', function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="lines"></ion-spinner>',
			duration: 60000
		});
		main.getCurrentPosition()
    .then(function(pos){
			main.map.center.latitude = pos.latitude;
			main.map.center.longitude = pos.longitude;
			main.curMarker.coords.latitude = pos.latitude;
			main.curMarker.coords.longitude = pos.longitude;
			$ionicLoading.hide();
    });
	});

	$scope.$on('$ionicView.afterEnter', function() {
		console.log('$ionicView.afterEnter');
		main.enabled = true;
		if (main.loadedMap) {
			// console.dir(main.mapCtrl);
			main.mapCtrl.refresh();
			main.loadSavedPlace();
		} else {
			main.loadMap();
		}

	});

	$scope.$on('$ionicView.afterLeave', function() {
		console.log('$ionicView.afterLeave');
		main.enabled = false;
	});

	main.showListDlg = function() {
		$ionicModal.fromTemplateUrl('saveplace/listmodal.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
			main.listDlg = modal;
			main.listDlg.show();
		});
	};

	main.closeListDlg = function() {
		main.listDlg.hide();
		main.listDlg.remove();
	};

	main.goToPlace = function(uplace_uuid) {
		$state.go('tab.places', {uplace_uuid: uplace_uuid});
		main.closeListDlg();
	};

	main.showPlaceDlg = function(index) {
		main.selectedPlace = main.posts[index];
		$ionicModal.fromTemplateUrl('saveplace/placemodal.html', {
			scope: $scope,
			animation: 'splat'
		})
		.then(function(modal) {
			main.placeDlg = modal;
			main.placeDlg.show();
		});
	};

	main.closePlaceDlg = function() {
		main.placeDlg.hide();
		main.placeDlg.remove();
	};

	main.getImageHeight = function() {
    var images = document.getElementsByClassName('user-image');
    for (var i = 0; i < images.length; i++) {
      if (images[i].clientWidth) {
        return parseInt(images[i].clientWidth / 3);
      }
    }
    return 0;
  };

	main.searchPlace = function() {
		var query = '';
    var region = main.selectedPlace.placePost.addr2 || main.selectedPlace.placePost.addr1 || main.selectedPlace.placePost.addr3 || null;
    console.log('Region : ' + region);
    if (region) {
      var region_items = region.content.split(' ');
      var loopCount = region_items.length >= 4 ? 4 : region_items.length;
      for (var i = 1; i < loopCount; i++) {
        query += region_items[i] + '+';
      }
    }

    query += (main.selectedPlace.placePost.name.content || main.selectedPlace.userPost.name.content);
    console.log('Calculated query : ', query);
    query = encodeURI(query);
    console.log('URL encoded query : ', query);

    window.open('https://m.search.naver.com/search.naver?sm=mtb_hty.top&where=m_blog&query=' + query, '_system');
	}

	main.hasTags = function(index) {
		//console.log('hasTags[' + index + '] : ' + (main.posts[index].tags.length > 0));
		return main.posts[index].tags.length > 0;
	}
}]);
