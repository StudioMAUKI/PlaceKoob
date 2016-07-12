'use strict';

angular.module('placekoob.config', [])
.config(function($ionicConfigProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
	console.log('config called');
	// CSRF token 설정을 위함 (꼭 들어가야 함!!)
	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
	$httpProvider.defaults.timeout = 5000;

	$ionicConfigProvider.tabs.position('bottom');

	$stateProvider
	.state('tab', {
    url: '',
    abstract: true,
    controller: 'tabCtrl',
    templateUrl: 'common/tab.html'
  })
	.state('tab.map', {
    url: '/map',
    views: {
      'map': {
        templateUrl: 'saveplace/map.html',
        controller: 'mapCtrl',
        controllerAs: 'map'
      }
    }
  })
	.state('tab.home-places', {
    url: '/home-places',
    views: {
      'places': {
        templateUrl: 'places/places-home.html',
        controller: 'placesHomeCtrl',
        controllerAs: 'placesHome'
      }
    }
  })
	.state('tab.places', {
    url: '/places?latitude&longitude&radius&rname&limit',
    views: {
      'places': {
        templateUrl: 'places/places.html',
        controller: 'placesCtrl',
        controllerAs: 'places'
      }
    }
  })
	.state('tab.places-not-yet', {
    url: '/places-not-yet',
    views: {
      'places': {
        templateUrl: 'places/places-notyet.html',
        controller: 'placesNotYetCtrl',
        controllerAs: 'plNotYet'
      }
    }
  })
	.state('tab.place', {
    url: '/places/:uplace_uuid',
    views: {
      'places': {
        templateUrl: 'places/place.html',
        controller: 'placeCtrl',
        controllerAs: 'place'
      }
    }
  })
	.state('tab.explore', {
    url: '/explore',
    views: {
      'explore': {
        templateUrl: 'explore/list.html',
        controller: 'listCtrl',
        controllerAs: 'list'
      }
    }
  })
	.state('tab.notice', {
    url: '/notice',
    views: {
      'notice': {
        templateUrl: 'notice/notice.html',
        controller: 'noticeCtrl',
        controllerAs: 'notice'
      }
    }
  })
	.state('tab.imported', {
    url: '/imported',
    views: {
      'imported': {
        templateUrl: 'imports/import-user.html',
        controller: 'importUserCtrl',
        controllerAs: 'importUser'
      }
    }
  })
	.state('tab.importedPlace', {
    url: '/imported/:iplace_uuid',
    views: {
      'imported': {
        templateUrl: 'imports/place.html',
        controller: 'imPlaceCtrl',
        controllerAs: 'imPlace'
      }
    }
  })
	.state('tab.import-image', {
    url: '/import-image',
    views: {
      'import-image': {
        templateUrl: 'imports/import-image.html',
        controller: 'importImageCtrl',
        controllerAs: 'importImage'
      }
    }
  })
  .state('tab.config-home', {
    url: '/config',
    views: {
      'config': {
        templateUrl: 'config/config.html',
        controller: 'configCtrl',
        controllerAs: 'config'
      }
    }
  })
	.state('tab.config-import', {
    url: '/config/import',
    views: {
      'config': {
        templateUrl: 'config/config-import.html',
        controller: 'configCtrl',
        controllerAs: 'config'
      }
    }
  })
	.state('register', {
		url: '/register',
		templateUrl: 'register/register.html',
		controller: 'registerCtrl',
		controllerAs: 'register'
	})
	.state('register-step1', {
		url: '/register/step1',
		templateUrl: 'register/step1.html',
		controller: 'registerStep1Ctrl',
		controllerAs: 'register'
	})
	.state('register-step2', {
		url: '/register/step2',
		templateUrl: 'register/step2.html',
		controller: 'registerStep2Ctrl',
		controllerAs: 'register'
	})
	.state('register-complete', {
		url: '/register/complete',
		templateUrl: 'register/complete.html',
		controller: 'registerCompleteCtrl',
		controllerAs: 'register'
	})
	.state('register-intro', {
		url: '/register/intro',
		templateUrl: 'register/intro.html',
		controller: 'registerIntroCtrl',
		controllerAs: 'intro'
	})
	.state('analyzer', {
		url: '/analyzer',
		templateUrl: 'album/analyzer.html',
		controller: 'analyzerCtrl',
		controllerAs: 'analyzer'
	});

	$urlRouterProvider.otherwise('/register');
	console.log('config call endid');
});
