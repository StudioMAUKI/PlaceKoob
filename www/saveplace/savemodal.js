'use strict';

angular.module('placekoob.controllers')
.controller('saveModalCtrl', ['$scope', '$ionicModal', '$ionicPopup', '$http', '$ionicLoading', 'StorageService', '$cordovaClipboard', '$q',  'RemoteAPIService', 'PhotoService', 'MapService', function($scope, $ionicModal, $ionicPopup, $http, $ionicLoading, StorageService, $cordovaClipboard, $q, RemoteAPIService, PhotoService, MapService) {
	var saveModal = this;
	saveModal.attatchedImage = '';
	saveModal.URL = '';

	saveModal.showAlert = function(title, msg) {
		return $ionicPopup.alert({ title: title, template: msg });
	}

	saveModal.savePosition = function() {
		PhotoService.getPhotoWithCamera()
		.then(function(imageURI) {
			saveModal.attatchedImage = imageURI;
			$ionicModal.fromTemplateUrl('saveplace/saveplace.html', {
				scope: $scope,
				animation: 'slide-in-up'
			})
			.then(function(modal) {
				saveModal.saveDlg = modal;
				saveModal.saveDlg.show();
			});
		}, function(err) {
			saveModal.showAlert('어이쿠', '저장을 위해, 현재 위치에서 사진을 찍어주세요.');
		});
	};

	saveModal.saveURL = function() {
		$ionicModal.fromTemplateUrl('saveplace/saveurl.html', {
			scope: $scope,
			animation: 'slide-in-up'
		})
		.then(function(modal) {
			saveModal.saveDlg = modal;
			saveModal.saveDlg.show();

			if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
				$cordovaClipboard.paste()
				.then(function(result) {
					console.log('URL in clipboard: ' + result);
					var pastedURL = result;
					if (pastedURL !== '') {
						saveModal.URL = pastedURL;
					}
				}, function(err) {
					console.error('Clipboard paste error : ' + error);
				});
			}
		})
	};

	saveModal.goToCurrentPosition = function() {
		$scope.$emit('map.request.gotocurrent');
	};

	saveModal.refresh = function() {
		$scope.$emit('map.request.refresh');
	};

	saveModal.closeSaveDlg = function() {
		saveModal.saveDlg.hide();
		saveModal.saveDlg.remove();

		saveModal.images = [];
		saveModal.note = '';
		saveModal.URL = '';
	};

	saveModal.getCurrentPosition = function() {
		var deferred = $q.defer();
		MapService.getCurrentPosition()
		.then(function(pos){
			StorageService.set('curPos', pos);
			RemoteAPIService.updateCurPos(pos);
			MapService.getCurrentAddress(pos.latitude, pos.longitude)
			.then(function(addrs) {
				StorageService.set('addr1', addrs.roadAddress.name);
				StorageService.set('addr2', addrs.jibunAddress.name);
				StorageService.set('addr3', addrs.region);
				console.info('addr1 : ', StorageService.get('addr1') + ', ' + addrs.roadAddress.name);
				console.info('addr2 : ', StorageService.get('addr2') + ', ' + addrs.jibunAddress.name);
				console.info('addr3 : ', StorageService.get('addr3') + ', ' + addrs.region);
				deferred.resolve(pos);
			}, function(err) {
				console.error(err);
				deferred.reject(err);
			});
		}, function(err) {
			deferred.reject(err);
		});
		return deferred.promise;
	};

	saveModal.confirmSave = function() {
		// var curPos = StorageService.get('curPos');
		// console.log('Current Corrds : ' + JSON.stringify(curPos));

		//	브라우저의 경우 테스트를 위해 분기함
		if (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid()) {
			saveModal.attatchedImage = saveModal.browserFile;
		}

		$ionicLoading.show({
			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
			duration: 60000
		});
		saveModal.getCurrentPosition()
		.then(function(curPos) {
			RemoteAPIService.uploadImage(saveModal.attatchedImage)
			.then(function(response) {
				// console.log('Image UUID: ' + response.uuid);

				RemoteAPIService.sendUserPost({
					lonLat: {
						lon: curPos.longitude,
						lat: curPos.latitude
					},
					notes: [{
						content: saveModal.note
					}],
					images: [{
						content: response.file
					}],
					addr1: { content: StorageService.get('addr1') || null },
					addr2: { content: StorageService.get('addr2') || null },
					addr3: { content: StorageService.get('addr3') || null },
				})
				.then(function(result) {
					StorageService.set('last_uplace_id', result.data.uplace_uuid);
					$ionicLoading.hide();
					saveModal.closeSaveDlg();
					$scope.$emit('posts.request.refresh');
				}, function(err) {
					$ionicLoading.hide();
					saveModal.showAlert('오류: 장소 저장', err)
					.then(function(){
						saveModal.closeSaveDlg();
					});
				});
			}, function(err) {
				$ionicLoading.hide();
				saveModal.showAlert('오류: 이미지 업로드', err)
				.then(function(){
					saveModal.closeSaveDlg();
				});
			});
		});
	};

	saveModal.confirmSaveURL = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="lines">저장 중..</ion-spinner>',
			duration: 60000
		});
		RemoteAPIService.sendUserPost({
			notes: [{
				content: saveModal.note
			}],
			urls: [{
				content: saveModal.URL
			}]
		})
		.then(function(result) {
			$ionicLoading.hide();
			saveModal.closeSaveDlg();
			$scope.$emit('posts.request.refresh');
		}, function(err) {
			$ionicLoading.hide();
			saveModal.showAlert('오류: URL 저장', err)
			.then(function(){
				saveModal.closeSaveDlg();
			});
		});
	};

	saveModal.getURLPreview = function() {
		if (saveModal.URL === '') {
			console.warn("URL must be valid value.");
			return;
		}
		if (!saveModal.URL.startsWith('http://') && !saveModal.URL.startsWith('https://')) {
			saveModal.URL = 'http://' + saveModal.URL;
		}

		// 브라우저 모드에서는 CORS 문제로 다른 도메인 호출이 기본적으로 안되기 때문에 테스트를 위해 분기를 시킴
		var reqURL = saveModal.URL;
		// test in web-browser
		if (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid()) {
			console.log('Test in browser-mode');
			reqURL = 'naver/PostView.nhn?blogId=mardukas&logNo=220647764523&redirect=Dlog&widgetTypeCall=true';
		}

		// 참고
		// /mardukas/220647764523
		// /PostView.nhn?blogId=mardukas&logNo=220647764523&redirect=Dlog&widgetTypeCall=true
		// 일단 감 잡았으.
		// 1. 네이버 블로그이냐 아니냐 판단 -> 맞을 경우 URL 변환
		// 2. open graph tag 탐색
		// 3. 성공한 경우 뿌려줌. 그렇지 않은 경우 별도로 실패 로그를 남기고 왜 그런치 추후 파악할 수 있도록 함
		// 4. 요 로직은 결국 서버에 둬야 함

		$http({
			method: 'GET',
			url: reqURL
		}).
		then(function(result) {
			console.log(result.data);
			var url = /<meta property="og:url"[\s]+content[\s]*=[\s]*['"][\S]+['"][\s]*\/>/i;
			console.log('URL content: ' + url.exec(result.data));
		}, function(err) {
			console.error(JSON.stringify(err));
		});
		console.log('URL : ' + saveModal.URL);
	}

	saveModal.showFileForm = function() {
		return (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid());
	}
}])
