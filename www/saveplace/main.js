'use strict';

angular.module('placekoob.controllers')
.controller('saveModalCtrl', ['$scope', '$ionicModal', '$ionicPopup', '$http', 'CacheService', '$cordovaClipboard', 'RemoteAPIService', 'PhotoService', function($scope, $ionicModal, $ionicPopup, $http, CacheService, $cordovaClipboard, RemoteAPIService, PhotoService) {
	var saveModal = this;
	saveModal.attatchedImage = '';
	saveModal.URL = '';

	saveModal.savePosition = function() {
		PhotoService.getPhotoWithCamera()
		.then(function(imageURI) {
			saveModal.attatchedImage = imageURI;
			$ionicModal.fromTemplateUrl('saveplace/saveplace.html', {
				scope: $scope,
				animation: 'slide-in-up'
			})
			.then(function(modal) {
				saveModal.saveDlg = modal;
				saveModal.saveDlg.show();
			});
		}, function(err) {
			$ionicPopup.alert({
				title: '어이쿠',
				template: '저장을 위해, 현재 위치에서 사진을 찍어주세요.'
			});
		});
	};

	saveModal.saveURL = function() {
		$ionicModal.fromTemplateUrl('saveplace/saveurl.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
			saveModal.saveDlg = modal;
			saveModal.saveDlg.show();

			if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
				$cordovaClipboard.paste()
				.then(function(result) {
					console.log('URL in clipboard: ' + result);
					var pastedURL = result;
					if (pastedURL !== '') {
						saveModal.URL = pastedURL;
					}
				}, function(err) {
					console.error('Clipboard paste error : ' + error);
				});
			}
		})
	};

	saveModal.closeSaveDlg = function() {
		saveModal.saveDlg.hide();
		saveModal.saveDlg.remove();

		saveModal.images = [];
		saveModal.note = '';
		saveModal.URL = '';
	};

	saveModal.confirmSave = function() {
		var curPos = CacheService.get('curPos');
		console.log('Current Corrds : ' + JSON.stringify(curPos));

		if (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid()) {
			saveModal.attatchedImage = saveModal.browserFile;
		}

		RemoteAPIService.uploadImage(saveModal.attatchedImage)
		.then(function(response) {
			console.log('Image UUID: ' + response.uuid);
			RemoteAPIService.sendUserPost({
				lonLat: {
					lon: curPos.longitude,
					lat: curPos.latitude
				},
				notes: [{
					content: saveModal.note
				}],
				images: [{
					content: response.file
				}],
				addrs: [{
					content: '테스트 주소(경기도 성남시 분당구 삼평동)'
				}]
			})
			.then(function(result) {
				console.log("Sending user post successed.");
				$ionicPopup.alert({
	        title: 'SUCCESS',
	        template: '현재 위치를 저장했습니다.'
	      })
				.then(function(){
					saveModal.closeSaveDlg();
					$scope.$emit('post.created');
				});
			}, function(err) {
				console.error("Sending user post failed.");
				$ionicPopup.alert({
	        title: 'ERROR: Create UPost',
	        template: JSON.stringify(err)
	      })
				.then(function(){
					saveModal.closeSaveDlg();
				});
			});
		}, function(err) {
			$ionicPopup.alert({
        title: 'ERROR: Upload Image',
        template: JSON.stringify(err)
      })
			.then(function(){
				saveModal.closeSaveDlg();
			});
		});
	};

	saveModal.confirmSaveURL = function() {
		RemoteAPIService.sendUserPost({
			notes: [{
				content: saveModal.note
			}],
			urls: [{
				content: saveModal.URL
			}]
		})
		.then(function(result) {
			console.log("Sending user post successed.");
			$ionicPopup.alert({
        title: 'SUCCESS',
        template: '웹문서를 저장했습니다.'
      })
			.then(function(){
				saveModal.closeSaveDlg();
				$scope.$emit('post.created');
			});
		}, function(err) {
			console.error("Sending user post failed.");
			$ionicPopup.alert({
        title: 'ERROR: Create UPost',
        template: JSON.stringify(err)
      })
			.then(function(){
				saveModal.closeSaveDlg();
			});
		});
	};

	saveModal.getURLPreview = function() {
		if (saveModal.URL === '') {
			console.warn("URL must be valid value.");
			return;
		}
		if (!saveModal.URL.startsWith('http://') && !saveModal.URL.startsWith('https://')) {
			saveModal.URL = 'http://' + saveModal.URL;
		}

		// 브라우저 모드에서는 CORS 문제로 다른 도메인 호출이 기본적으로 안되기 때문에 테스트를 위해 분기를 시킴
		var reqURL = saveModal.URL;
		// test in web-browser
		if (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid()) {
			console.log('Test in browser-mode');
			reqURL = 'naver/PostView.nhn?blogId=mardukas&logNo=220647764523&redirect=Dlog&widgetTypeCall=true';
		}

		// 참고
		// /mardukas/220647764523
		// /PostView.nhn?blogId=mardukas&logNo=220647764523&redirect=Dlog&widgetTypeCall=true
		// 일단 감 잡았으.
		// 1. 네이버 블로그이냐 아니냐 판단 -> 맞을 경우 URL 변환
		// 2. open graph tag 탐색
		// 3. 성공한 경우 뿌려줌. 그렇지 않은 경우 별도로 실패 로그를 남기고 왜 그런치 추후 파악할 수 있도록 함
		// 4. 요 로직은 결국 서버에 둬야 함

		$http({
			method: 'GET',
			url: reqURL
		}).
		then(function(result) {
			console.log(result.data);
			var url = /<meta property="og:url"[\s]+content[\s]*=[\s]*['"][\S]+['"][\s]*\/>/i;
			console.log('URL content: ' + url.exec(result.data));
		}, function(err) {
			console.error(JSON.stringify(err));
		});
		console.log('URL : ' + saveModal.URL);
	}

	saveModal.showFileForm = function() {
		return (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid());
	}
}])
.controller('mainCtrl', ['$scope', '$ionicPopup', '$ionicSlideBoxDelegate', '$state', 'uiGmapGoogleMapApi', 'MapService', 'RemoteAPIService', 'CacheService', 'PostHelper', function($scope, $ionicPopup, $ionicSlideBoxDelegate, $state, uiGmapGoogleMapApi, MapService, RemoteAPIService, CacheService, PostHelper) {
	var main = this;
	main.postHelper = PostHelper;
	main.prevIndex = -1;
	main.needToUpdateCurMarker = false;

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
			main.map.center.latitude = main.posts[index - 1].userPost.lonLat.lat;
			main.map.center.longitude = main.posts[index - 1].userPost.lonLat.lon;
		}
		//	기존의 슬라이드의 마커는 기본 상태로 되돌리고
		if (main.prevIndex != 0 && main.prevIndex != -1) {
				main.posts[main.prevIndex - 1].options.icon = 'img/icon/pin_base_small.png';
		}
		//	현재 선택된 슬라이드를 저장하여, 다음의 기존 슬라이드 인덱스로 사용한다
		main.prevIndex = index;
	}

	// 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
	main.divToFit = function() {
		var divMap = $(document);
		$('.angular-google-map-container').css({
			height: divMap.height() - 91	// 137 : height = document - bar - tab_bar
		});
	};
	main.divToFit();

	uiGmapGoogleMapApi.then(function(maps) {
		MapService.getCurrentPosition().
    then(function(pos){
				CacheService.add('curPos', pos);
        main.map = {
					center: {
						latitude: pos.latitude,
						longitude: pos.longitude
					},
					events: {
						dragend: function(map, event, args) {
							main.needToUpdateCurMarker = true;
						},
						center_changed: function(map, event, args) {
							CacheService.add('curPos', main.map.center);

							//	지도의 중심이 바뀔때마다 현재 위치 마커의 위치를 바꾸지 않고, 드래그 후 발생한 중심 변경만 반영한다
							if (main.needToUpdateCurMarker) {
								//	속성별로 뜯어서 복사하지 않고, 객체수준으로 복사하면 참조하게 되어 그 때부터
								//	지도와 마커가 한 몸으로 움직이게 되므로 피해야 한다
								main.currentPosMarker.coords.latitude = main.map.center.latitude;
								main.currentPosMarker.coords.longitude = main.map.center.longitude;
								main.needToUpdateCurMarker = false;
							}
						}
					},
					zoom: 14,
					options: {
						zoomControl: false,
						mapTypeControl: false,
						streetViewControl: false
					}
				};
				// marker for current position
        main.currentPosMarker = {
          id: 'currentPosMarker',
          coords: {
            latitude: pos.latitude,
            longitude: pos.longitude
          },
          options: {
						draggable: true,
						icon: 'img/icon/main_pin_small.png'
					},
          events: {
            dragend: function (currentPosMarker, eventName, args) {
              main.map.center.latitude = main.currentPosMarker.coords.latitude;
							main.map.center.longitude = main.currentPosMarker.coords.longitude;
            }
          }
        };

				main.loadSavedPlace();
      },
      function(reason){
        $ionicPopup.alert({ title: 'Warning!', template: reason });
      }
    );
  });

	main.loadSavedPlace = function(force) {
		var pos = CacheService.get('curPos');
		RemoteAPIService.getPostsWithPlace(pos.latitude, pos.longitude, 2000, force)
		.then(function(posts) {
			var limit = posts.length > 10 ? 10 : posts.length;
			main.posts = posts.slice(0, limit);
			//console.dir(posts);

			// markers for saved positions
			for(var i = 0; i < limit; i++) {
				main.posts[i].id = i;
				main.posts[i].options = {
					draggable: false,
					icon: 'img/icon/pin_base_small.png'
				};
				main.posts[i].coords = {
					latitude: main.posts[i].userPost.lonLat.lat,
					longitude: main.posts[i].userPost.lonLat.lon
				}
			}
			$ionicSlideBoxDelegate.update();
		});
	};

	main.goPlace = function(place_id) {
		console.log('goPlace : ' + place_id);
		$state.go('tab.places', {place_id: place_id});
	}

	$scope.$on('post.created', function() {
		main.loadSavedPlace(true);
	});
}]);
