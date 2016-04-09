'use strict';

angular.module('placekoob.config', [])
.config(function($ionicConfigProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
	// CSRF token 설정을 위함 (꼭 들어가야 함!!)
	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

	$ionicConfigProvider.tabs.position('bottom');

	$stateProvider
	.state('tab', {
    url: '',
    abstract: true,
    controller: 'tabCtrl',
    templateUrl: 'common/tab.html'
  })
	.state('tab.home', {
    url: '/home',
    views: {
      'home': {
        templateUrl: 'saveplace/main.html',
        controller: 'mainCtrl',
        controllerAs: 'main'
      }
    }
  })
  .state('tab.places', {
    url: '/places?place_id',
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
    url: '/places/:place_id',
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
  .state('tab.config', {
    url: '/config',
    views: {
      'config': {
        templateUrl: 'config/config.html',
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
		controller: 'registerCtrl',
		controllerAs: 'register'
	})
	.state('register-step2', {
		url: '/register/step2',
		templateUrl: 'register/step2.html',
		controller: 'registerCtrl',
		controllerAs: 'register'
	})
	.state('register-complete', {
		url: '/register/complete',
		templateUrl: 'register/complete.html',
		controller: 'registerCtrl',
		controllerAs: 'register'
	})
	.state('analyzer', {
		url: '/analyzer',
		templateUrl: 'album/analyzer.html',
		controller: 'analyzerCtrl',
		controllerAs: 'analyzer'
	});

	$urlRouterProvider.otherwise('/home');
})
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDkuFga8fr1c4PjzSAiHaBWo26zvQbtxB8',
        v: '3.22', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});
