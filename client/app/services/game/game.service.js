/**
 * @ngdoc service
 * @name gameService
 * @description Interacts with game, variant, and move data.
 */
angular.module('gameService', ['userService', 'restangular', 'socketService'])
.factory('gameService', ['$http', 'userService', 'Restangular', 'socketService', '$q', function($http, userService, Restangular, socketService, $q) {
    'use strict';

    return {
        /**
         * Gets all games associated with the logged-in user.
         * @memberof GameService
         * @returns {Promise<array>} A list of games.
         */
        getAllForCurrentUser: function() {
            return $q(function(resolve) {
                socketService.emit('game:userlist', {
                    playerID: userService.getCurrentUser()
                }, function(games) {
                    resolve(games);
                });
            });
        },

        getVariant: function(variantName) {
            // strip spaces
            variantName = _.camelCase(variantName);
            return $http.get('variants/' + variantName + '/' + variantName + '.json');
        },

        getAllVariantNames: function() {
            return Restangular.all('variants').getList();
        },

        getGame: function(gameID) {
            return Restangular.one('users', userService.getCurrentUser()).one('games', gameID).get();
        },

        getAllOpenGames: function() {
            return Restangular.all('games').getList();
        },

        getMoveData: function(gameID, year, season) {
            var options = { };
            if (year)
                options.year = year;
            if (season)
                options.season = season;

            return Restangular.one('games', gameID).getList('moves', options);
        },

        getMoveDataForCurrentUser: function(gameID, year, season) {
            var options = { };
            if (year)
                options.year = year;
            if (season)
                options.season = season;

            return Restangular.one('users', userService.getCurrentUser()).one('games', gameID).getList('moves', options);
        },

        createNewGame: function(game) {
            Restangular.all('games').post(game);
        },

        /**
         * @description Signs the current user up for a game.
         * @param {Object} game    A game.
         * @param {Object} [options] Power preferences, if allowed.
         */
        joinGame: function(game, options) {
            options = options || { };
            options.gameID = game._id;
            Restangular.one('users', userService.getCurrentUser()).all('games').post(options);
        }
    };
}]);
