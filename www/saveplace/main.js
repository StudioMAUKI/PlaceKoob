'use strict';

angular.module('placekoob.controllers')
.controller('mainCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicPlatform', '$ionicModal', '$timeout', '$ionicPopup', function($scope, $ionicSideMenuDelegate, $ionicPlatform, $ionicModal, $timeout, $ionicPopup) {
	var main = this;
	main.clearSearchText = function() {
		console.log("Search key world : " + $scope.keyWord);
		$scope.keyWord = "";
	};

	main.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};

 	main.createMap = function() {
	 	var container = document.getElementById('myMap');
	 	var options = {
	 		center: new daum.maps.LatLng(33.450701, 126.570667),
	 		level: 3
	 	};
	 	var map = new daum.maps.Map(container, options);
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
 		$('#myMap').css({
 			height: divMap.height() - 37
 		});
 		// main.height = divMap.height();
 	};

 	$(document).ready(function() {
 		main.divToFit();
 		main.createMap();
 		$(window).resize(function() {
 			main.divToFit();
 		});
 	});
}]);