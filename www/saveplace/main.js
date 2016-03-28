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
	main.places = placeListService.getPlaces();

	// 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
 	main.divToFit = function() {
 		var divMap = $(document);
 		$('.angular-google-map-container').css({
 			height: divMap.height() - 91	// 137 : height = document - bar - tab_bar
 		});
 	};
	main.divToFit();

	uiGmapGoogleMapApi.then(function(maps) {
		console.log('uiGmapGoogleMapApi.then()');
    MapService.getCurrentPosition().
    then(function(pos){
        main.map = {
					center: {
						latitude: pos.latitude,
						longitude: pos.longitude
					},
					events: {
						dragend: function(map, event, args) {
							main.currentPosMarker.coords = main.map.center;
						}
					},
					zoom: 16,
					options: {
						zoomControl: false,
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
          options: { draggable: true },
          events: {
            dragend: function (currentPosMarker, eventName, args) {
              main.map.center = main.currentPosMarker.coords;
            }
          }
        };
				// // markers for saved positions
				// main.savedMarkers = [];
				// console.log("length of places : " + main.places.length);
				// for(var i = 0; i < main.places.length; i++) {
				// 	main.savedMarkers += {
				// 		id: i,
	      //     coords: {
	      //       latitude: main.places[i].coords.latitude,
	      //       longitude: main.places[i].coords.longitude
	      //     },
	      //     options: { draggable: false }
				// 	}
				// 	console.log(main.places[i].coords.latitude + ',' + main.places[i].coords.longitude);
				// }
      },
      function(reason){
        $ionicPopup.alert({ title: 'Warning!', template: reason });
      }
    );
  });
}]);
