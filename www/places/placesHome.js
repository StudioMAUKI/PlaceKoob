'use strict';

angular.module('placekoob.controllers')
.controller('placesHomeCtrl', ['$scope', '$state', 'RemoteAPIService', function($scope, $state, RemoteAPIService) {
	console.log('placesHomeCtrl is called.');
	var placesHome = this;
	var remote = RemoteAPIService;
	placesHome.calculatedHeight = 0;
	placesHome.regions = [];
	placesHome.totalCount = 0;

	remote.getRegionsOfMine()
	.then(function(list) {
		// console.dir(list);
		placesHome.regions = list;
		placesHome.totalCount = 0;
		for (var i = 0; i < list.length; i++) {
			placesHome.totalCount += list[i].count;
		}
	}, function(err) {
		console.error(err);
	});

	placesHome.openFullList = function(){
		$state.go('tab.places');
	};

	placesHome.getImageHeight = function() {
		var images = document.getElementsByClassName('region-list');
		console.log('images.length : ' + images.length);
    for (var i = 0; i < images.length; i++) {
			console.log('images[i].clientWidth : ' + images[i].clientWidth);
      if (images[i].clientWidth) {
				// placesHome.calculatedHeight = parseInt((images[i].clientWidth - 30) / 3);
				placesHome.calculatedHeight = parseInt((images[i].clientWidth - 10) / 2);
        return placesHome.calculatedHeight;
      }
    }
    return 0;
  };

	placesHome.goToPlaces = function(index) {
		console.log('Places index : ' + index);
		$state.go('tab.places', {
			latitude: placesHome.regions[index].lonLat.lat,
			longitude: placesHome.regions[index].lonLat.lon,
			radius: placesHome.regions[index].radius,
			rname: encodeURI(placesHome.regions[index].name + ' ' + placesHome.regions[index].radiusName),
			limit: placesHome.regions[index].count
		});
	}
}]);
