'use strict';

angular.module('games', [
    'ui.router',
    'ngMaterial'
])
.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
    .state('games', {
        abstract: true,
        url: '/games',
        template: '<ui-view />'
    })
    .state('games.list', {
        url: '',
        controller: 'GameListController',
        templateUrl: 'app/games/games.html',
        data: {
            restricted: true
        }
    })
    .state('games.new', {
        url: '/new',
        controller: 'NewGameController',
        templateUrl: 'app/games/new/new.html',
        data: {
            restricted: true
        }
    })
    .state('games.view', {
        url: '/{id:[0-9a-fA-F]{24}}',
        controller: 'ViewController',
        templateUrl: 'app/games/view/view.html',
        data: {
            restricted: true
        }
    });
}]);
