angular.module('mapService', ['gameService'])
.service('mapService', ['$location', 'gameService', function($location, gameService) {
    'use strict';

    var regionReferenceDictionary,
        currentAction = 'hold',
        commandData = [],
        service = function(variant, game, season) {
            this.variant = variant;
            this.game = game;
            this.season = season;

            regionReferenceDictionary = _.indexBy(this.variant.regions, 'r');
        };

    service.prototype.getSCFill = getSCFill;
    service.prototype.getSCTransform = getSCTransform;
    service.prototype.getUnitFill = getUnitFill;
    service.prototype.getCoordinatesForUnitInRegion = getCoordinatesForUnitInRegion;
    service.prototype.generateMarkerEnd = generateMarkerEnd;
    service.prototype.setAction = setAction;
    service.prototype.inputCommand = inputCommand;
    service.prototype.userCanMove = userCanMove;
    service.prototype.userCanAdjust = userCanAdjust;
    service.prototype.userCanRetreat = userCanRetreat;
    service.prototype.getSCPath = getSCPath;
    service.prototype.isActionCurrent = isActionCurrent;

    return service;

    // PRIVATE FUNCTIONS

    function getSCFill(r) {
        var owner = _.find(this.season.regions, 'r', r).sc;
        return owner ? this.variant.powers[owner].colour : '#bbbbbb';
    }

    function getSCTransform(r) {
        return 'translate(' +
            regionReferenceDictionary[r.toUpperCase()].sc.x + ',' +
            regionReferenceDictionary[r.toUpperCase()].sc.y + ') ' +
            'scale(0.04)';
    }

    function getUnitFill(r) {
        var container = gameService.getUnitOwnerInRegion(r);
        return this.variant.powers[container.unit.power].colour;
    }

    function generateMarkerEnd(target) {
        // See CSS file for why separate markers exist for failed orders.
        var failed = target.failed ? 'failed' : '';
        return 'url(' + $location.absUrl() + '#' + failed + target.action + ')';
    }

    function getCoordinatesForUnitInRegion(r, type) {
        var subregionWithUnit = _.find(r.sr, { unit: { type: type } });

        if (subregionWithUnit) {
            subregionWithUnit = _.find(regionReferenceDictionary[r.r].sr, 'r', subregionWithUnit.r);
            return { x: subregionWithUnit.x, y: subregionWithUnit.y };
        }

        return { x: regionReferenceDictionary[r.r].x, y: regionReferenceDictionary[r.r].y };
    }

    function setAction(action) {
        currentAction = action;

        // Reset any half-made orders.
        clearAllCommands();
    }

    function clearAllCommands() {
        while (commandData.length) commandData.pop();
    }

    function inputCommand(id, callback) {
        var r = id.toUpperCase().replace('-', '/'), // HTML IDs use - for subdivisions.
            region = _.find(this.season.regions, 'r', r.split('/')[0]),
            ownerInRegion = gameService.getUnitOwnerInRegion(region),
            unitInRegion,
            overrideAction;

        if (ownerInRegion)
            unitInRegion = ownerInRegion.unit;

        // TODO: Force armies to move to regions only.

        // Users who try to control units that don't exist or don't own?
        // We have ways of shutting the whole thing down.
        if (commandData.length === 0 &&
            (!unitInRegion || unitInRegion.power !== gameService.getPowerOfCurrentUserInGame(this.game)))
            return;

        commandData.push(r);

        switch (currentAction) {
        case 'hold':
            // Don't bother retaining clicks. Just continue on to send the command.
            break;
        case 'move':
            // Source, target.
            if (commandData.length < 2)
                return;

            // Don't move to yourself. Treat this as a hold.
            if (commandData[0] === commandData[1]) {
                commandData.pop();
                overrideAction = 'hold';
            }
            break;
        case 'support':
            // Don't support yourself. Treat this as a hold.
            if (commandData[0] === commandData[1]) {
                clearAllCommands();
                overrideAction = 'hold';
            }
            // Source, target, target of target.
            else if (commandData.length < 3) {
                return;
            }
            // Source, holding target.
            else if (commandData[1] === commandData[2]) {
                commandData.pop();
            }
            break;
        case 'convoy':
            break;
        }

        // Making it this far means there is a full set of commands to publish.
        gameService.publishCommand(currentAction, commandData, this.season,
            function(response) {
                callback(response, commandData[0], overrideAction || currentAction, commandData[1], commandData[2]);
                clearAllCommands();
            }
        );
    }

    function userCanMove() {
        return _.contains(this.season.season.toLowerCase(), 'move');
    }

    function userCanRetreat() {
        return _.contains(this.season.season.toLowerCase(), 'retreat');
    }

    function userCanAdjust() {
        return _.contains(this.season.season.toLowerCase(), 'adjust');
    }

    function getSCPath() {
        return $location.absUrl() + '#sc';
    }

    function isActionCurrent(action) {
        return action === currentAction;
    }
}]);