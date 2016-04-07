'use strict';

angular.module('placekoob.controllers')
.controller('registerCtrl', ['$scope', '$state', '$ionicHistory', '$ionicPopup', 'StorageService', 'RemoteAPIService', function($scope, $state, $ionicHistory, $ionicPopup, StorageService, RemoteAPIService) {
	var register = this;
	register.email = '';

	register.goStep1 = function() {
		$state.go('register-step1');
	};

	register.goStep2 = function() {
		var emailRegExp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

		if (register.email === '') {
			$ionicPopup.alert({
        title: '잠시만요!',
        template: '이메일 주소를 입력해 주세요.'
      })
			.then(function(result) {
				return;
			});
		} else if (!emailRegExp.test(register.email)) {
			$ionicPopup.alert({
        title: '잠시만요!',
        template: '유효한 이메일 주소를 입력해 주세요.'
      })
			.then(function(result) {
				return;
			});
		}else {
			StorageService.addData('email', register.email);
			register.sendEmail(register.email)
			.then(function(result) {
				console.log('Send email : ' + result);
				$state.go('register-step2');
			}, function(err) {
				console.error(err);
			});
		}
	};

	register.sendEmail = function(email) {
		return {
			then: function(success, error) {
				success(true);
			}
		}
	}

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

	register.goHome = function() {
		$state.go('tab.home');
	};

	register.goBack = function() {
		$ionicHistory.goBack();
	}
}]);
