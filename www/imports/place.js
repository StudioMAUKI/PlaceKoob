'use strict';

angular.module('placekoob.controllers')
.controller('imPlaceCtrl', ['$scope', '$stateParams', '$state', '$ionicHistory', '$ionicPopup', 'RemoteAPIService', 'ogParserService', 'daumSearchService', function($scope, $stateParams, $state, $ionicHistory, $ionicPopup, RemoteAPIService, ogParserService, daumSearchService) {
  var imPlace = this
  imPlace.iplace_uuid = $stateParams.iplace_uuid;
  imPlace.coverImage = 'img/default.jpg';
  // imPlace.URLs = [];
  imPlace.searchResults = [];
  imPlace.tagsForUpdate = [];
  imPlace.starPoint = 5;
  imPlace.starPointIcons = ['ion-ios-star', 'ion-ios-star', 'ion-ios-star-half', 'ion-ios-star-outline', 'ion-ios-star-outline'];

  $scope.$on('$ionicView.afterEnter', function() {
		imPlace.loadPlaceInfo();
	});

  imPlace.changeStarPoint = function() {
    // console.log(imPlace.starPoint);
    var starPointArray = [
      ['ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
      ['ion-ios-star-half', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star-half', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star', 'ion-ios-star-outline', 'ion-ios-star-outline', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star', 'ion-ios-star-half', 'ion-ios-star-outline', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-outline', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-half', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-outline'],
      ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star-half'],
      ['ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star', 'ion-ios-star']
    ];

    imPlace.starPointIcons = starPointArray[imPlace.starPoint];
  };

  imPlace.loadPlaceInfo = function() {
    RemoteAPIService.getPost(imPlace.iplace_uuid)
    .then(function(post) {
      console.dir(post);
      imPlace.post = post;
      if (imPlace.post.userPost.images) {
        imPlace.imagesForSlide = [];
        for (var i = 0; i < imPlace.post.userPost.images.length; i++) {
          imPlace.imagesForSlide.push(imPlace.post.userPost.images[i].content);
        }
        imPlace.coverImage = imPlace.post.userPost.images[0].summary;
        // $scope.$apply();
      }

      // imPlace.URLs = [];
      // if (imPlace.post.userPost.urls) {
      //   for (var i = 0; i < imPlace.post.userPost.urls.length; i++) {
      //     ogParserService.getOGInfo(imPlace.post.userPost.urls[i].content)
      //     .then(function(ogInfo) {
      //       imPlace.URLs.push(ogInfo);
      //     }, function(err) {
      //       console.error(err);
      //     });
      //   }
      // }

      // for (var i = 0; i < imPlace.post.userPost.tags.length; i++) {
      //   imPlace.post.userPost.tags[i].color = imPlace.getTagColor();
      // }

      imPlace.getDaumResult();
      imPlace.tagsForUpdate = [];
      imPlace.starPoint = post.userPost.rating ? post.userPost.rating.content : 0;
      imPlace.changeStarPoint();
    }, function(err) {
      $ionicPopup.alert({
        title: '죄송합니다!',
        template: '해당하는 장소 정보를 불러올 수 없습니다.'
      })
      .then(function() {
        imPlace.goBack();
      });
    });
  };

  imPlace.deletePlace = function() {
    $ionicPopup.confirm({
			title: '장소 삭제',
			template: '정말로 저장한 장소를 지우시겠습니까?'
		})
		.then(function(res){
			if (res) {
        RemoteAPIService.deleteUserPost(imPlace.iplace_uuid)
        .then(function() {
          $ionicPopup.alert({
            title: '성공',
            template: '삭제되었습니다'
          })
          .then(function() {
            imPlace.goBack();
          });
        }, function(err) {
          console.error(err);
        });
      }
		});
  };

  imPlace.goBack = function() {
    console.log('Move Back');
    // $state.go('tab.places');
    $ionicHistory.goBack();
  };

  imPlace.openLink = function(url) {
    window.open(url, '_system');
  };

  imPlace.makeKeyword = function() {
    var keyword = '';
    if (imPlace.post.placePost) {
      var region = imPlace.post.placePost.addr2 || imPlace.post.placePost.addr1 || imPlace.post.placePost.addr3 || null;
      console.log('Region : ' + region);
      if (region) {
        var region_items = region.content.split(' ');
        var loopCount = region_items.length >= 4 ? 4 : region_items.length;
        for (var i = 1; i < loopCount; i++) {
          keyword += region_items[i] + '+';
        }
      }

      keyword += (imPlace.post.placePost.name.content || imPlace.post.userPost.name.content);
      console.log('Calculated keyword : ', keyword);
      keyword = encodeURI(keyword);
      console.log('URL encoded keyword : ', keyword);
    }
    return keyword;
  };

  imPlace.getDaumResult = function() {
    var keyword = imPlace.makeKeyword();
    if (keyword !== '') {
      daumSearchService.search(keyword)
      .then(function(items) {
        imPlace.searchResults = items;
        for (var i = 0; i < imPlace.searchResults.length; i++) {
          imPlace.searchResults[i].title = imPlace.searchResults[i].title.replace(/<b>/g, '').replace(/&lt;b&gt;/g, '').replace(/&lt;\/b&gt;/g, '').replace(/&quot;/g, '"');
          imPlace.searchResults[i].description = imPlace.searchResults[i].description.replace(/<b>/g, '').replace(/&lt;b&gt;/g, '').replace(/&lt;\/b&gt;/g, '').replace(/&quot;/g, '"');
        }
        // console.dir(imPlace.searchResults);

      }, function(err) {
        imPlace.searchResults = [];
        imPlace.searchResults.push({
          author: 'MAUKI studio',
          comment: '',
          description: JSON.stringify(err),
          link: '',
          title: '검색 결과를 얻어 오는데 실패했습니다'
        })
      });
    }
  };

  imPlace.searchPlace = function() {
    window.open('https://m.search.naver.com/search.naver?sm=mtb_hty.top&where=m_blog&query=' + imPlace.makeKeyword(), '_system');
  };

  imPlace.goToMap = function(lonLat) {
    console.log('goToMap : ' + JSON.stringify(lonLat));
    //  이거 타임아웃 안해주면, 에러남!!
    setTimeout(function() {
      $state.go('tab.map');
      $scope.$emit('map.changeCenter.request', lonLat);
    }, 100);
  };
}]);
