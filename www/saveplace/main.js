'use strict';

angular.module('placekoob.controllers')
.controller('saveModalCtrl', ['$scope', '$ionicModal', '$ionicPopup', '$timeout', function($scope, $ionicModal, $ionicPopup, $timeout) {
	var saveModal = this;

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
	};

	saveModal.confirmSave = function() {
		$timeout(function() {
			var completePopup = $ionicPopup.show({
	    		templateUrl: 'saveplace/complete.html',
	    		title: '저장 완료!',
	    		scope: $scope,
	    		buttons: [{
	        		text: '<b>확인</b>',
	        		type: 'button-energized',
	        		onTap: function(e) {
			          completePopup.close();
			          saveModal.closeSaveDlg();
	        		}
	      		}]
			});
		}, 1000);
	};
}])
.controller('mainCtrl', ['$ionicPopup', 'uiGmapGoogleMapApi', 'MapService', 'placeListService', function($ionicPopup, uiGmapGoogleMapApi, MapService, placeListService) {
	var main = this;
	main.placelist = placeListService;
	main.places = placeListService.getPlaces();
	main.mapCtrl = {};
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
        main.map = {
					center: {
						latitude: pos.latitude,
						longitude: pos.longitude
					},
					events: {
						dragend: function(map, event, args) {
							//main.currentPosMarker.coords = main.map.center;
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
