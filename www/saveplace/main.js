'use strict';

angular.module('placekoob.controllers')
.controller('saveModalCtrl', ['$scope', '$ionicModal', '$cordovaCamera', '$cordovaImagePicker', '$ionicPopup', 'PlaceManager', 'CacheService', function($scope, $ionicModal, $cordovaCamera, $cordovaImagePicker, $ionicPopup, PlaceManager, CacheService) {
	var saveModal = this;
	saveModal.images = [];

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

	saveModal.closeSaveDlg = function() {
		saveModal.saveDlg.hide();
		saveModal.saveDlg.remove();
		saveModal.images = [];
	};

	saveModal.confirmSave = function() {
		var curPos = CacheService.get('curPos');
		console.log('Current Corrds : ' + JSON.stringify(curPos));
		PlaceManager.saveCurrentPlace({
			images: saveModal.images,
			note: saveModal.note,
			coords: curPos
		})
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
