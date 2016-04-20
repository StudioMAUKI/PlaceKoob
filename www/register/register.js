'use strict';

angular.module('placekoob.controllers')
.controller('registerCtrl', ['$scope', '$state', '$ionicPopup', 'RemoteAPIService', function($scope, $state, $ionicPopup, RemoteAPIService) {
	console.log('registerCtrl is called.');
	var register = this;
	register.needToRegister = false;
	register.email = '';

	function resetUserInfo() {
		register.needToRegister = true;
		RemoteAPIService.logoutUser();
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
      console.log('auth_user_token: ' + result);

      // 유저 로그인
      RemoteAPIService.loginUser(result)
      .then(function(result) {
        console.log('User Login successed : ' + result);

        // 이메일 정보를 가지고 있는가?
        if (RemoteAPIService.hasEmail()) {
          // VD 등록
          RemoteAPIService.registerVD()
          .then(function(result) {
            console.log('auth_vd_token: ' + result);

            // VD 로그인
            RemoteAPIService.loginVD(result)
            .then(function(result) {
              console.log('VD Login successed : ' + result);
              $state.go('tab.home');
            }, function(err) {
              console.error(err);
              resetUserInfo();
            });
          }, function(err) {
            console.error(err);
            resetUserInfo();
          });
        } else {
          resetUserInfo();
        }
      }, function(err) {
        console.error(err);
				resetUserInfo();
        //showAlert('사용자 로그인 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
        showAlert(JSON.stringify(err), '사용자 로그인 오류');
      });
    }, function(err) {
      console.error('User Registration failed: ' + JSON.stringify(err));
			resetUserInfo();
      // showAlert('사용자 등록 과정에서 오류가 발생했습니다. 앱을 종료해주세요.ㅠㅠ');
			showAlert(JSON.stringify(err), '사용자 등록 오류');
    });
	};

	register.goStep1 = function() {
		$state.go('register-step1');
	};

	$scope.$on('$ionicView.afterEnter', function() {
		console.log('After entering Register View..');
		register.init();
	});
}]);
