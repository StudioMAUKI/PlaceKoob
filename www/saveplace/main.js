'use strict';

angular.module('placekoob.controllers')
.controller('mainCtrl', ['$scope', '$ionicPopup', '$state', '$ionicScrollDelegate', '$ionicLoading', '$q', 'uiGmapGoogleMapApi', 'MapService', 'RemoteAPIService', 'StorageService', function($scope, $ionicPopup, $state, $ionicScrollDelegate, $ionicLoading, $q,  uiGmapGoogleMapApi, MapService, RemoteAPIService, StorageService) {
	var main = this;
	main.prevIndex = -1;
	main.last_marker_index = -1;
	main.needToUpdateCurMarker = false;
	main.last_coords = StorageService.get('curPos') || { latitude: 37.5666103, longitude: 126.9783882 };
	main.map = { center: main.last_coords, zoom: 15 };

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
	main.jumpToSlide = function(index) {
		$ionicScrollDelegate.$getByHandle('mapScroll').scrollTo(window.innerWidth * index,0, true);
	};

	main.goToCurrentPosition = function() {
		main.jumpToSlide(0);
	};

	main.slidehasChanged = function(index) {
		if (index !== 0) {
			main.posts[index].options.icon = 'img/icon/pin_active.svg';
		}
		main.map.center.latitude = main.posts[index].coords.latitude;
		main.map.center.longitude = main.posts[index].coords.longitude;

		//	기존의 슬라이드의 마커는 기본 상태로 되돌리고
		if (main.prevIndex != 0 && main.prevIndex != -1 && main.prevIndex < main.posts.length) {
				main.posts[main.prevIndex].options.icon = 'img/icon/pin_normal.svg';
		}
		//	현재 선택된 슬라이드를 저장하여, 다음의 기존 슬라이드 인덱스로 사용한다
		main.prevIndex = index;
		$scope.$digest();
	}

	main.getCurrentPosition = function() {
		var deferred = $q.defer();
		MapService.getCurrentPosition()
		.then(function(pos){
			StorageService.set('curPos', pos);
			main.getCurrentRegion(pos.latitude, pos.longitude);
			RemoteAPIService.updateCurPos(pos);
			deferred.resolve(pos);
		}, function(err) {
			deferred.reject(err);
		});
		return deferred.promise;
	};
	main.getCurrentRegion = function(latitude, longitude) {

		MapService.getCurrentAddress(latitude, longitude)
		.then(function(addrs) {
			StorageService.set('addr1', addrs.roadAddress.name);
			StorageService.set('addr2', addrs.jibunAddress.name);
			StorageService.set('addr3', addrs.region);
			console.info('addr1 : ', StorageService.get('addr1') + ', ' + addrs.roadAddress.name);
			console.info('addr2 : ', StorageService.get('addr2') + ', ' + addrs.jibunAddress.name);
			console.info('addr3 : ', StorageService.get('addr3') + ', ' + addrs.region);
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

	uiGmapGoogleMapApi.then(function(maps) {
		$ionicLoading.show({
			template: '<ion-spinner icon="lines"></ion-spinner>',
			duration: 60000
		});

		StorageService.set('addr1', '');
		StorageService.set('addr2', '');
		StorageService.set('addr3', '');

		main.getCurrentPosition()
    .then(function(pos){
      main.map = {
				center: {
					latitude: pos.latitude,
					longitude: pos.longitude
				},
				// events: {
				// 	dragend: function(map, event, args) {
				// 		main.needToUpdateCurMarker = true;
				// 	},
				// 	center_changed: function(map, event, args) {
				// 		StorageService.set('curPos', main.map.center);
				//
				// 		//	지도의 중심이 바뀔때마다 현재 위치 마커의 위치를 바꾸지 않고, 드래그 후 발생한 중심 변경만 반영한다
				// 		if (main.needToUpdateCurMarker) {
				// 			//	속성별로 뜯어서 복사하지 않고, 객체수준으로 복사하면 참조하게 되어 그 때부터
				// 			//	지도와 마커가 한 몸으로 움직이게 되므로 피해야 한다
				// 			main.currentPosMarker.coords.latitude = main.map.center.latitude;
				// 			main.currentPosMarker.coords.longitude = main.map.center.longitude;
				// 			main.needToUpdateCurMarker = false;
				// 		}
				// 	}
				// },
				zoom: 15,
				options: {
					zoomControl: false,
					mapTypeControl: false,
					streetViewControl: false
				}
			};

			main.loadSavedPlace()
			.finally(function(){
				$ionicLoading.hide();
			});
    }, function(err){
      $ionicPopup.alert({ title: 'Warning!', template: err });
    });
  });

	main.loadSavedPlace = function() {
		var deferred = $q.defer();
		var pos = StorageService.get('curPos');
		RemoteAPIService.getPostsWithPlace(pos.latitude, pos.longitude, 0)
		.then(function(posts) {
			//	현재 위치에 대한 post를 먼저 작성하고, 얻어온 포스트 배열을 뒤에 추가한다
			main.posts = [{
				id: 0,
				coords: {
					latitude: pos.latitude,
					longitude: pos.longitude
				},
				options: {
					draggable: true,
					icon: 'img/icon/pin_current.svg',
					events: {
						dragend: function (marker, eventName, args) {
							main.map.center.latitude = marker.position.lat();
							main.map.center.longitude = marker.position.lng();
							main.getCurrentRegion(main.map.center.latitude, main.map.center.longitude);
							StorageService.set('curPos', main.map.center);
						},
						click: function(marker, eventName, args) {
							main.jumpToSlide(marker.key);
						}
					}
				},
				uplace_uuid: '',
				thumbnailURL: 'img/icon/pin_current.svg',
				name: '현재 위치',
				phoneNo: '',
				address: main.address,
				desc: '왼쪽으로 밀어 저장된 곳을 둘러보세요.'
			}].concat(posts);

			// markers for saved positions
			for(var i = 1; i <= posts.length; i++) {
				main.posts[i].id = i;
				main.posts[i].options = {
					draggable: false,
					icon: 'img/icon/pin_normal.svg',
					events: {
	          click: function(marker, eventName, args) {
							main.jumpToSlide(marker.key);
						}
	        }
				};
				main.posts[i].coords = {
					latitude: main.posts[i].lonLat.lat,
					longitude: main.posts[i].lonLat.lon
				}
			}

			main.scrollToMarker = function() {
				var scrolled_pos = $ionicScrollDelegate.$getByHandle('mapScroll').getScrollPosition().left;
				if (scrolled_pos % window.innerWidth === 0) {
					//	동일 스크롤 위치에 대한 이벤트가 연달아 두번 발생해서 처리함 (왜 그럴까..?)
					var index = scrolled_pos / window.innerWidth;
					if (main.last_marker_index !== index) {
						main.last_marker_index = index;
						window.setTimeout(function() {
							main.slidehasChanged(index);
						}, 200);
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
		main.goToCurrentPosition();
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
			main.posts[0].coords.latitude = pos.latitude;
			main.posts[0].coords.longitude = pos.longitude;
			$ionicLoading.hide();
    });
	});
	$scope.$on('$ionicView.afterEnter', function() {
		main.loadSavedPlace();
	});
}]);
