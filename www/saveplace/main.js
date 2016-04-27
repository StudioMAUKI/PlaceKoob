'use strict';

angular.module('placekoob.controllers')
.controller('mainCtrl', ['$scope', '$ionicPopup', '$ionicSlideBoxDelegate', '$state', 'uiGmapGoogleMapApi', 'MapService', 'RemoteAPIService', 'StorageService', function($scope, $ionicPopup, $ionicSlideBoxDelegate, $state, uiGmapGoogleMapApi, MapService, RemoteAPIService, StorageService) {
	console.log('mainCtrl is called.');
	var main = this;
	main.prevIndex = -1;
	main.needToUpdateCurMarker = false;
	main.last_coords = StorageService.get('curPos') || { latitude: 37.5666103, longitude: 126.9783882 };
	main.map = { center: main.last_coords, zoom: 15 };
	main.currentPosMarker = {
		id: 'currentPosMarker',
		coords: main.last_coords,
		options: {
			draggable: true,
			icon: 'img/icon/main_pin_small.png'
		}
	};

	main.slidehasChanged = function(index) {
		//	여기서 미묘한 문제는..
		//	슬라이드는 [0][1] ... [N]로  인데,
		//	마커는	[cur][0][1] ... [N-1]인 형태로 매핑이 되는 것을 감안하여 처리해야 함

		//	선택된 슬라이드의 위치로 지도를 이동시키고, 관련 마커를 활성화된 상태로 바꿔주고
		if (index == 0) {
			main.map.center.latitude = main.currentPosMarker.coords.latitude;
			main.map.center.longitude = main.currentPosMarker.coords.longitude;
		} else {
			main.posts[index - 1].options.icon = 'img/icon/pin_active_small.png';
			main.map.center.latitude = main.posts[index - 1].lonLat.lat;
			main.map.center.longitude = main.posts[index - 1].lonLat.lon;
		}
		//	기존의 슬라이드의 마커는 기본 상태로 되돌리고
		if (main.prevIndex != 0 && main.prevIndex != -1) {
				main.posts[main.prevIndex - 1].options.icon = 'img/icon/pin_base_small.png';
		}
		//	현재 선택된 슬라이드를 저장하여, 다음의 기존 슬라이드 인덱스로 사용한다
		main.prevIndex = index;
	}

	main.getCurrentRegion = function(latitude, longitude) {
		MapService.getCurrentAddress(latitude, longitude)
		.then(function(addrs) {
			main.address = addrs.region || '';
		});
	};

	// 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
	main.divToFit = function() {
		var divMap = $(document);
		$('.angular-google-map-container').css({
			height: divMap.height() - 91	// 137 : height = document - bar - tab_bar
		});

		$('.slide-scroll-on-map').css({
			width: window.innerWidth,
			height: 90
		});
	};
	main.divToFit();

	uiGmapGoogleMapApi.then(function(maps) {
		MapService.getCurrentPosition()
    .then(function(pos){
			main.getCurrentRegion(pos.latitude, pos.longitude);

			// pos.latitude = 37.4003292;
			// pos.longitude = 127.1032845;
			StorageService.set('curPos', pos);
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
			// marker for current position
      main.currentPosMarker = {
        coords: {
          latitude: pos.latitude,
          longitude: pos.longitude
        },
        events: {
          dragend: function (currentPosMarker, eventName, args) {
            main.map.center.latitude = main.currentPosMarker.coords.latitude;
						main.map.center.longitude = main.currentPosMarker.coords.longitude;
						main.getCurrentRegion(main.currentPosMarker.coords.latitude, main.currentPosMarker.coords.longitude);
          },
					click: function(currentPosMarker, eventName, args) {
						$ionicSlideBoxDelegate.slide(0);
					}
        }
      };

			main.loadSavedPlace();
    }, function(err){
      $ionicPopup.alert({ title: 'Warning!', template: err });
    });
  });

	main.loadSavedPlace = function(force) {
		var pos = StorageService.get('curPos');
		RemoteAPIService.getPostsWithPlace(pos.latitude, pos.longitude, 0, force)
		.then(function(posts) {
			var max = 20;
			var limit = posts.length > max ? max : posts.length;
			main.posts = posts.slice(0, posts.length > max ? max : posts.length);

			// markers for saved positions
			for(var i = 0; i < limit; i++) {
				main.posts[i].id = i;
				main.posts[i].options = {
					draggable: false,
					icon: 'img/icon/pin_base_small.png',
					events: {
	          click: function(marker, eventName, args) {
							$ionicSlideBoxDelegate.slide(marker.key + 1);
						}
	        }
				};
				main.posts[i].coords = {
					latitude: main.posts[i].lonLat.lat,
					longitude: main.posts[i].lonLat.lon
				}
			}
			$ionicSlideBoxDelegate.update();
		});
	};

	main.goPlace = function(uplace_uuid) {
		console.log('goPlace : ' + uplace_uuid);
		$state.go('tab.places', {uplace_uuid: uplace_uuid});
	}

	$scope.$on('post.created', function() {
		main.loadSavedPlace(true);
	});

	$scope.$on('$ionicView.afterEnter', function() {
		console.log('After entering main View..');
		//main.loadSavedPlace(true);
	});

	$scope.$on('$ionicView.beforeLeave', function() {
		console.log('Before leaving main View..');
	});

	main.list = [];
	var color_array = ['bg-red', 'bg-blue', 'bg-green'];
	for (var i = 0; i < 100; i++) {
      main.list.push({
        id: i,
        color: (function(i) {
          return color_array[i%3];
        })(i)
      });
    }

	main.getWidth = function () {
		console.log('get Width :' + window.innerWidth + 'px');
    return window.innerWidth + 'px';
  };
  main.getFullWidth = function () {
    console.log('page length : ' + document.getElementsByClassName('page').length);
    return parseInt(window.innerWidth * document.getElementsByClassName('page').length) + 'px';
  };
  main.getHeight = function () {
    // return parseInt(document.getElementById('scroller').clientHeight - document.getElementById('header').clientHeight) + 'px';
    return '90px';
  }
}]);
