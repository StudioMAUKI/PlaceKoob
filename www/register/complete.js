'use strict';

angular.module('placekoob.controllers')
.controller('registerCompleteCtrl', ['$rootScope', '$scope', '$state', '$ionicHistory', '$ionicPopup',  'StorageService', 'RemoteAPIService', function($rootScope, $scope, $state, $ionicHistory, $ionicPopup, StorageService, RemoteAPIService) {
	console.log('registerCompleteCtrl is called.');
	var register = this;

	function showAlert(msg, callback) {
    $ionicPopup.alert({
      title: '오류가 발생했습니다',
      template: msg
    })
    .then(function(res) {
      callback();
    });
  };

  register.goHome = function() {
		$state.go('tab.map');
	};

	register.goBack = function() {
		$ionicHistory.goBack();
	}

	register.loginVD = function() {
		function goRegister() {
			$state.go('register');
		}

		RemoteAPIService.registerVD()
		.then(function(result) {
			// VD 로그인
			RemoteAPIService.loginVD(result)
			.then(function(result) {
				setTimeout(function() {
					$state.go('register-intro');
				}, 500);
			}, function(err) {
				console.error(err);
				showAlert('서버 접속 중 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ', goRegister);
			});
		}, function(err) {
			console.error(err);
			showAlert('이메일 등록 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ', goRegister);
		});
	}

	$scope.$on('$ionicView.afterEnter', function() {
		register.loginVD();
	});
}]);
