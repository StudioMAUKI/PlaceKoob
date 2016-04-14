'use strict';

angular.module('placekoob.controllers')
.controller('registerStep2Ctrl', ['$state', '$ionicHistory', '$ionicPopup', 'RemoteAPIService', function($state, $ionicHistory, $ionicPopup, RemoteAPIService) {
	console.log('registerStep2Ctrl is called.');
	var register = this;

  function showAlert(msg) {
    $ionicPopup.alert({
      title: '오류가 발생했습니다',
      template: msg
    })
    .then(function(res) {
      console.log('앱을 종료할려는데..');
      ionic.Platform.exitApp();
    });
  };

  register.resendEmail = function(email) {
		$ionicPopup.alert({
			title: '알림',
			template: '이메일이 재전송 되었습니다.'
		})
		.then(function(result) {
			return;
		});
	}

	register.goComplete = function() {
		// 완료 페이지로 이동하기 전에 VD register와 VD login을 완료
		// VD 등록
		RemoteAPIService.registerVD()
		.then(function(result) {
			console.log('auth_vd_token: ' + result);

			// VD 로그인
			RemoteAPIService.loginVD(result)
			.then(function(result) {
				console.log('VD Login successed : ' + result);
				$state.go('register-complete');
			}, function(err) {
				console.error(err);
				showAlert('서버 접속 중 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
			});
		}, function(err) {
			console.error(err);
			showAlert('이메일 등록 과정에서 오류가 발생했습니다. 앱을 종료해 주세요.ㅠㅠ');
		});
	};

	register.goBack = function() {
		$ionicHistory.goBack();
	}
}]);
