'use strict';

angular.module('placekoob.controllers')
.controller('registerCtrl', ['$scope', '$state', '$ionicPopup', 'RemoteAPIService', function($scope, $state, $ionicPopup, RemoteAPIService) {
	console.log('registerCtrl is called.');
	var register = this;
	register.needToRegister = false;
	register.email = '';

	function resetUserInfo(step) {
		register.needToRegister = true;
		RemoteAPIService.logoutUser(step);
	}

	function showAlert(msg, title) {
    $ionicPopup.alert({
      title: title || '오류가 발생했습니다',
      template: msg
    })
    .then(function(res) {
      console.log('앱을 종료할려는데..');
			ionic.Platform.exitApp();
    });
  };

	register.init = function() {
		// 유저 등록
    RemoteAPIService.registerUser()
    .then(function(result) {
      // 유저 로그인
      RemoteAPIService.loginUser(result)
      .then(function(result) {
        // 이메일 정보를 가지고 있는가?
        if (RemoteAPIService.hasEmail()) {
          // VD 등록
          RemoteAPIService.registerVD()
          .then(function(result) {
            // VD 로그인
            RemoteAPIService.loginVD(result)
            .then(function(result) {
              $state.go('tab.home');
            }, function(err) {
              console.error(err);
              resetUserInfo(4);
            });
          }, function(err) {
            console.error(err);
            resetUserInfo(3);
          });
        } else {
          resetUserInfo(3);
        }
      }, function(err) {
        console.error(err);
				resetUserInfo(2);
        //showAlert('사용자 로그인 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
        showAlert(JSON.stringify(err), '사용자 로그인 오류');
      });
    }, function(err) {
      console.error('User Registration failed: ' + JSON.stringify(err));
			resetUserInfo(1);
      // showAlert('사용자 등록 과정에서 오류가 발생했습니다. 앱을 종료해주세요.ㅠㅠ');
			showAlert(JSON.stringify(err), '사용자 등록 오류');
    });
	};

	register.goStep1 = function() {
		$state.go('register-step1');
	};

	$scope.$on('$ionicView.afterEnter', function() {
		register.init();
	});

	register.init();
}]);
