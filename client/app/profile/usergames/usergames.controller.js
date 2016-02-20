'use strict';

angular.module('profile')
.controller('UserGamesController', ['$scope', 'userService', 'gameService', 'games', 'gmGames', function($scope, userService, gameService, games, gmGames) {
    var i,
        theGame,
        variantName,
        key;

    $scope.selectedIndex = 0;

    $scope.variants = { };
    $scope.moves = { };

    $scope.playing = games;
    $scope.GMing = gmGames;
    $scope.user = userService.getCurrentUser();

    for (i = 0; i < games.length; i++) {
        theGame = games[i];

        // Identify what variants need fetching.
        variantName = theGame.variant;
        if (!$scope.variants[variantName])
            $scope.variants[variantName] = { };

        /*
         * Identify the extent of each game's move data to get, given these rules:
         *     1) Old seasons are fully exposed: old positions, moves, resolution.
         *     2) Current seasons expose old positions.
         *     3) Players see their own orders in current seasons.
         *     4) GMs see everything in current seasons.
        if (theGame.isAdmin)
            $scope.moves[theGame._id] = gameService.getMoveData(theGame._id);//.then(movesToScopeCallback);
        else
            $scope.moves[theGame._id] = gameService.getMoveDataForCurrentUser(theGame._id, theGame.year, theGame.season);//.then(movesToScopeCallback);
            */
    }

    // Populate keys.
    for (key in $scope.variants)
        $scope.variants[key] = gameService.getVariant(key);
}]);
