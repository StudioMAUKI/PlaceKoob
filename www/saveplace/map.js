'use strict';

angular.module('placekoob.controllers')
.controller('mapCtrl', ['$scope', '$ionicPopup', '$state', '$ionicScrollDelegate', '$ionicLoading', '$q', '$ionicModal', 'gmapService', 'MapService', 'RemoteAPIService', 'StorageService', function($scope, $ionicPopup, $state, $ionicScrollDelegate, $ionicLoading, $q, $ionicModal,  gmapService, MapService, RemoteAPIService, StorageService) {
  var map = this;
  map.prevIndex = 0;
	map.last_marker_index = -1;
	map.needToUpdateCurMarker = false;
	map.last_coords = StorageService.get('curPos') || { latitude: 37.5666103, longitude: 126.9783882 };
	map.lastMapCenter = {};
	map.enabled = true;
  map.mapOption = {
		center: {
      lat: map.last_coords.latitude,
      lng: map.last_coords.longitude
    },
		zoom: 15,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false
	};


  // 컨텐츠 영역에 지도를 꽉 채우기 위한 함수 (중요!!!)
	map.divToFit = function() {
		var documentHeight = $(document).height();
		var barHeight = document.getElementsByTagName('ion-header-bar')[0].clientHeight || 44;
    var buttonBarHeight = document.getElementsByClassName('button-bar')[0].clientHeight || 50;
		var tabHeight = document.getElementsByClassName('tabs')[0].clientHeight || 49;
    console.info('Document Height : ' + documentHeight);
		console.info('Bar Height : ' + barHeight);
    console.info('Button Bar Height : ' + buttonBarHeight);
		console.info('Tab Height : ' + tabHeight);
		$('#map').css({
			height: documentHeight
        - barHeight
        - buttonBarHeight
        - tabHeight// 137 : height = document - bar - tab_bar
		});
	};
  map.divToFit();

  map.getWidth = function () {
		return window.innerWidth + 'px';
  };
  map.getFullWidth = function () {
    return parseInt(window.innerWidth * document.getElementsByClassName('page').length) + 'px';
  };
  map.getHeight = function () {
    // return parseInt(document.getElementById('scroller').clientHeight - document.getElementById('header').clientHeight) + 'px';
    return '90px';
  };

  map.caculateDist = function(lat1, lon1, lat2, lon2)
	{
    function deg2rad(deg) { return (deg * Math.PI / 180); }
  	function rad2deg(rad) { return (rad * 180 / Math.PI); }

	  var dist = Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(lon1 - lon2));
	  return  Number(rad2deg(Math.acos(dist)) * 60 * 1.1515 * 1.609344 * 1000).toFixed(2);
	}

  map.mapObj = gmapService.createMap('map', map.mapOption);

}]);
