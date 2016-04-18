'use strict';

angular.module('placekoob.controllers')
.controller('saveModalCtrl', ['$scope', '$ionicModal', '$ionicPopup', '$http', 'CacheService', '$cordovaClipboard', 'RemoteAPIService', 'PhotoService', 'MapService', function($scope, $ionicModal, $ionicPopup, $http, CacheService, $cordovaClipboard, RemoteAPIService, PhotoService, MapService) {
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

	saveModal.closeSaveDlg = function() {
		saveModal.saveDlg.hide();
		saveModal.saveDlg.remove();

		saveModal.images = [];
		saveModal.note = '';
		saveModal.URL = '';
	};

	saveModal.confirmSave = function() {
		var curPos = CacheService.get('curPos');
		console.log('Current Corrds : ' + JSON.stringify(curPos));

		//	브라우저의 경우 테스트를 위해 분기함
		if (!ionic.Platform.isIOS() && !ionic.Platform.isAndroid()) {
			saveModal.attatchedImage = saveModal.browserFile;
		}

		RemoteAPIService.uploadImage(saveModal.attatchedImage)
		.then(function(response) {
			console.log('Image UUID: ' + response.uuid);

			MapService.getCurrentAddress(curPos.latitude, curPos.longitude)
			.then(function(addrs) {
				//	주소 프로퍼티에 대입할 주소 배열 생성
				var resultAddrs = [];
				if (addrs.roadAddress.name !== '') {
					resultAddrs.push({content: addrs.roadAddress.name});
				}
				if (addrs.jibunAddress.name !== '') {
					resultAddrs.push({content: addrs.jibunAddress.name});
				}

				//	직전에 저장한 장소와 같은 곳인지 비교해서, 같으면 같은 uplace_uuid를 써서 올림
				var last_lon = parseFloat(CacheService.get('last_lon'));
				var last_lat = parseFloat(CacheService.get('last_lat'));
				var prev_uplace_uuid = null;
				if (curPos.longitude === last_lon && curPos.latitude === last_lat) {
					prev_uplace_uuid = CacheService.get('last_uplace_uuid');
					prev_uplace_uuid = prev_uplace_uuid === '' ? null : prev_uplace_uuid;
					console.log('prev_uplace_uuid: ' + prev_uplace_uuid);
				}

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
					addr1: { content: addrs.roadAddress.name !== '' ? addrs.roadAddress.name : null },
					addr2: { content: addrs.jibunAddress.name !== '' ? addrs.jibunAddress.name : null },
					addr3: { content: addrs.region !== '' ? addrs.region : null },
					uplace_uuid: prev_uplace_uuid
				})
				.then(function(result) {
					//console.dir(result);
					CacheService.set('last_uplace_uuid', result.data.uplace_uuid);
					CacheService.set('last_lon', curPos.longitude);
					CacheService.set('last_lat', curPos.latitude);

					saveModal.showAlert('성공', '현재 위치를 저장했습니다.')
					.then(function(){
						saveModal.closeSaveDlg();
						$scope.$emit('post.created');
					});
				}, function(err) {
					console.error("Sending user post failed.");
					saveModal.showAlert('오류: 장소 저장', err)
					.then(function(){
						saveModal.closeSaveDlg();
					});
				});
			}, function(err) {
				saveModal.showAlert('오류: 주소 얻기 실패', err)
				.then(function(){
					saveModal.closeSaveDlg();
				});
			});
		}, function(err) {
			saveModal.showAlert('오류: 이미지 업로드', err)
			.then(function(){
				saveModal.closeSaveDlg();
			});
		});
	};

	saveModal.confirmSaveURL = function() {
		RemoteAPIService.sendUserPost({
			notes: [{
				content: saveModal.note
			}],
			urls: [{
				content: saveModal.URL
			}]
		})
		.then(function(result) {
			saveModal.showAlert('성공', '웹문서를 저장했습니다.')
			.then(function(){
				saveModal.closeSaveDlg();
				$scope.$emit('post.created');
			});
		}, function(err) {
			console.error("Sending user post failed.");
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
