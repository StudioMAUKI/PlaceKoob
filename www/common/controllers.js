'use strict';

angular.module('placekoob.controllers', [])
.controller('tabCtrl', ['$scope', '$state', function($scope, $state){
  $scope.$on('map.changeCenter.request', function(event, lonLat) {
    // console.log('tabCtrl.map.changeCenter : ' + JSON.stringify(lonLat));
    $scope.$broadcast('map.changeCenter', lonLat);
  });

  $scope.goPlacesHome = function() {
    console.log('goPlacesHome');
    $state.go('tab.home-places');
  };
}]);
