'use strict';

angular.module('placekoob.controllers')
.controller('saveModalCtrl', ['$scope', '$ionicModal', '$cordovaCamera', '$cordovaImagePicker', '$ionicPopup', '$http', 'PlaceManager', 'CacheService', '$cordovaClipboard', function($scope, $ionicModal, $cordovaCamera, $cordovaImagePicker, $ionicPopup, $http, PlaceManager, CacheService, $cordovaClipboard) {
	var saveModal = this;
	saveModal.images = [];
	saveModal.URL = '';

	if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
		$cordovaClipboard.paste()
		.then(function(result) {
			var pastedURL = result;
			if (pastedURL !== '') {
				// var confirmPopup = $ionicPopup.confirm({
				// 	title: '클립보드에 저장한 내용이 있습니다',
				// 	template: '클립보드의 URL을 붙여넣기 하시겠습니까?'
				// });
				//
				// confirmPopup.then(function(result) {
				// 	if(result) {
						saveModal.URL = pastedURL;
				// 	}
				// });
			}

		}, function(err) {
			console.error('Clipboard paste error : ' + error);
		});
	}

	saveModal.savePosition = function() {
		$ionicModal.fromTemplateUrl('saveplace/saveplace.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
			saveModal.saveDlg = modal;
			saveModal.saveDlg.show();
		})
	};

	saveModal.saveURL = function() {
		$ionicModal.fromTemplateUrl('saveplace/saveurl.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
			saveModal.saveDlg = modal;
			saveModal.saveDlg.show();
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
		PlaceManager.saveCurrentPlace({
			images: saveModal.images,
			note: saveModal.note,
			coords: curPos
		});
		saveModal.closeSaveDlg();
	};

	saveModal.confirmSaveURL = function() {		
		saveModal.closeSaveDlg();
	};

	saveModal.addImageWithCamera = function() {
		if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
			var options = {
	      quality: 70,
	      destinationType: Camera.DestinationType.FILE_URI,
	      sourceType: Camera.PictureSourceType.CAMERA,
	      allowEdit: false,
	      encodingType: Camera.EncodingType.JPEG,
	      targetWidth: 1024,
	      targetHeight: 768,
	      popoverOptions: CameraPopoverOptions,
	      correctOrientation: true,
	      saveToPhotoAlbum: false
	    };

	    $cordovaCamera.getPicture(options)
	    .then(function (imageURI) {
	      saveModal.images.push(imageURI);
	      console.log('imageUrl: ' + imageURI);
	    }, function (error) {
	      console.error('Camera capture failed : ' + error);
				alert(error);
	    });
		} else {	// test in web-browser
			saveModal.images.push('http://cfile4.uf.tistory.com/image/2773F53C565C0DA82E6FDB');
		}
	};

	saveModal.addImageWithPhotoLibrary = function() {
		var restCount = 5 - saveModal.images.length;
		if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
			$cordovaImagePicker.getPictures({
	      maximumImagesCount: restCount,
	      width: 1024
	    }).
	    then(function(imageURIs) {
	      for (var i = 0; i < imageURIs.length; i++) {
	        console.log('Image URI: ' + imageURIs[i]);
	        //alert(results[i]);
	        saveModal.images.push(imageURIs[i]);
	      }
	    }, function (error) {
	      console.error(error);
	    });
		} else {	// test in web-browser
			for (var i = 0; i < restCount; i++){
				saveModal.images.push('http://cfile8.uf.tistory.com/image/231BB0435212BE3E0D4A3C');
			}
		}
	};

	saveModal.popUpForRemove = function(index) {
		var confirmPopup = $ionicPopup.confirm({
			title: '사진 첨부',
			template: '선택하신 사진을 제외하시겠습니까?'
		});

		confirmPopup.then(function(result) {
			if(result) {
				saveModal.images.splice(index, 1);
			}
		});
	}

	saveModal.getURPreview = function() {
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
}])
.controller('mainCtrl', ['$ionicPopup', 'uiGmapGoogleMapApi', 'MapService', 'placeListService', 'CacheService', function($ionicPopup, uiGmapGoogleMapApi, MapService, placeListService, CacheService) {
	var main = this;
	main.places = placeListService.getPlaces();
	main.activeIndex = -1;


	main.slidehasChanged = function(index) {
		if (main.activeIndex != -1) {
			main.places[main.activeIndex].options.icon = 'img/icon/pin_base_small.png';
		}

		main.activeIndex = index - 1;
		if (index == -1) {
			main.map.center = main.currentPosMarker.coords;
		} else {
			main.map.center.latitude = main.places[main.activeIndex].coords.latitude;
			main.map.center.longitude = main.places[main.activeIndex].coords.longitude;
			main.places[main.activeIndex].options.icon = 'img/icon/pin_active_small.png';
		}
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
							main.currentPosMarker.coords = main.map.center;
						},
						center_changed: function(map, event, args) {
							console.log('Map center changed : ' + JSON.stringify(main.map.center));
							CacheService.add('curPos', main.map.center);
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
              main.map.center = main.currentPosMarker.coords;
            }
          }
        };

				// markers for saved positions
				for(var i = 0; i < main.places.length; i++) {
					main.places[i].id = i;
					main.places[i].options = {
						draggable: false,
						icon: 'img/icon/pin_base_small.png'
					};
				}
      },
      function(reason){
        $ionicPopup.alert({ title: 'Warning!', template: reason });
      }
    );
  });
}]);
