'use strict';

angular.module('placekoob.controllers')
.controller('placesHomeCtrl', ['$scope', '$state', 'RemoteAPIService', 'DOMHelper', function($scope, $state, RemoteAPIService, DOMHelper) {
	console.log('placesHomeCtrl is called.');
	var placesHome = this;
	var remote = RemoteAPIService;
	placesHome.calculatedHeight = DOMHelper.getImageHeight('region-list', 3, 5);
	placesHome.regions = [];
	placesHome.totalCount = 0;

	remote.getRegionsOfMine()
	.then(function(list) {
		console.dir(list);
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
