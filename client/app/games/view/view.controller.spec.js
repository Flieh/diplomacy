describe('Game view controller', function() {
    'use strict';

    var scope,
        mockUserService,
        mockGameService,
        variant,
        game,
        season,
        createController;

    beforeEach(function() {
        variant = {

        };
        season = {

        };
        game = {
            gm_id: '123'
        };

        mockUserService = {
            getCurrentUser: function() {
                return {
                    _id: '123'
                };
            }
        };
        mockGameService = {

        };
        angular.mock.module('userService', function($provide) {
            $provide.value('userService', mockUserService);
        });
        angular.mock.module('gameService', function($provide) {
            $provide.value('gameService', mockGameService);
        });
        angular.mock.module('games');

        inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            createController = function(theVariant, theGame, theSeason) {
                return $controller('ViewController', {
                    $scope: scope,
                    variant: theVariant,
                    season: theSeason,
                    game: theGame
                });
            };
        });
    });

    describe('Read-only status', function() {
        it('is read-only for GMs', function() {
            createController(variant, game, season);
            scope.$digest();
            expect(scope.readonly).to.be.true;
        });

        it('is not read-only for players', function() {
            game.gm_id = '666';
            createController(variant, game, season);
            scope.$digest();
            expect(scope.readonly).to.be.false;
        });
    });
});
