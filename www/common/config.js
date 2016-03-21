'use strict';

angular.module('placekoob.config', [])
.config(function($ionicConfigProvider, $stateProvider, $urlRouterProvider) {
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
    .state('tab.place-list', {
      url: '/placelist',
      views: {
        'place-list': {
          templateUrl: 'placelist/placelist.html',
          controller: 'placeListCtrl',
          controllerAs: 'placeList'
        }
      }
    })
		.state('tab.place', {
      url: '/place',
      views: {
        'place-list': {
          templateUrl: 'placelist/place.html',
          controller: 'placeCtrl',
          controllerAs: 'place'
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
