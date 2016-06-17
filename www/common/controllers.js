'use strict';

angular.module('placekoob.controllers', [])
.controller('tabCtrl', ['$scope', function($scope){
  $scope.$on('map.changeCenter.request', function(event, lonLat) {
    // console.log('tabCtrl.map.changeCenter : ' + JSON.stringify(lonLat));
    $scope.$broadcast('map.changeCenter', lonLat);
  });
}]);
