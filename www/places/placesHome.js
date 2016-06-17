'use strict';

angular.module('placekoob.controllers')
.controller('placesHomeCtrl', ['$scope', 'RemoteAPIService', function($scope, RemoteAPIService) {
	console.log('placesHomeCtrl is called.');
	var placesHome = this;
	var remote = RemoteAPIService;

	remote.getRegionsOfMine()
	.then(function(list) {
		console.dir(list);
	}, function(err) {
		console.error(err);
	});

}]);
