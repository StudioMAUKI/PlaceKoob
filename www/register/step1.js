'use strict';

angular.module('placekoob.controllers')
.controller('registerStep1Ctrl', ['$state', '$ionicPopup', 'StorageService', function($state, $ionicPopup, StorageService) {
	console.log('registerStep1Ctrl is called.');
	var register = this;
	register.email = '';

	register.goStep2 = function() {
		var emailRegExp = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

		if (register.email === '') {
			$ionicPopup.alert({
        title: '잠시만요!',
        template: '이메일 등록은 필수 사항 입니다.'
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
				register.email = '';
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
}]);
