'use strict';

angular.module('placekoob.controllers')
.controller('mainCtrl', ['$scope', '$ionicModal', '$timeout', '$ionicPopup', 'uiGmapGoogleMapApi', 'MapService', function($scope, $ionicModal, $timeout, $ionicPopup, uiGmapGoogleMapApi, MapService) {
	var main = this;
	main.clearSearchText = function() {
		console.log("Search key world : " + main.keyWord);
		main.keyWord = "";
	};

	main.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

 	main.savePosition = function() {
		$ionicModal.fromTemplateUrl('saveplace/saveplace.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
			main.saveDlg = modal;
			main.saveDlg.show();
		})
	};

	main.closeSaveDlg = function() {
		main.saveDlg.hide();
		main.saveDlg.remove();
	};

	main.confirmSave = function() {
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
			          main.closeSaveDlg();
	        		}
	      		}]
			});
		}, 1000);
	};

	// 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
 	main.divToFit = function() {
 		var divMap = $(document);
 		$('.angular-google-map-container').css({
 			height: divMap.height() - 137	// 137 : height = document - bar - sub_bar - tab_bar
 		});
 	};
	main.divToFit();

	uiGmapGoogleMapApi.then(function(maps) {
    MapService.getCurrentPosition().
    then(function(pos){
        main.map = { center: { latitude: pos.latitude, longitude: pos.longitude }, zoom: 16 };
        main.marker = {
          id: 0,
          coords: {
            latitude: pos.latitude,
            longitude: pos.longitude
          },
          options: { draggable: true },
          events: {
            dragend: function (marker, eventName, args) {
              var lat = marker.getPosition().lat();
              var lon = marker.getPosition().lng();

              main.marker.options = {
                draggable: true,
                labelContent: "lat: " + main.marker.coords.latitude + ' ' + 'lon: ' + main.marker.coords.longitude,
                labelAnchor: "100 0",
                labelClass: "marker-labels"
              };
            }
          }
        }
      },
      function(reason){
        console.log(reason);
       var alertPopup = $ionicPopup.alert({
         title: 'Warning!',
         template: reason
       });

       alertPopup.then();
      }
    );
  });
}]);
