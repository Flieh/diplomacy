'use strict';

var db = require('./../db'),
    async = require('async'),
    winston = require('winston');

// Log all the things.
winston.transports.Console.level = 'debug';

function PhaseCore(options) {
    options = options || { };
    if (options.core)
        this.core = options.core;
}

PhaseCore.prototype.initFromVariant = function(t, variant, game, deadline, cb) {
    var self = this,
        newPhase = new db.models.Phase({
            year: variant.startYear,
            season: variant.phases[0],
            game_id: game.get('id'),
            deadline: deadline
        });

    async.waterfall([
        // Save new phase.
        function(callback) {
            newPhase.save(null, { transacting: t }).asCallback(callback);
        },

        // Generate region data for this phase, using variant template.
        function(phase, callback) {
            newPhase = phase;
            self.generatePhaseProvincesFromTemplate(t, variant, phase, callback);
        }
    ], function(err, result) {
        if (err)
            cb(err, null);
        else
            cb(null, newPhase);
    });
};

/**
 * Bulk inserts provinces based on phase data or variant data.
 * @param  {Transaction} t           The transaction.
 * @param  {Object}      variant     The variant template.
 * @param  {Phase}       phase       The phase owning the new provinces.
 * @param  {Function}    cb          The callback.
 */
PhaseCore.prototype.generatePhaseProvincesFromTemplate = function(t, variant, phase, cb) {
    async.each(variant.provinces, function(province, eachCallback) {
        async.parallel([
            function(parallelCallback) {
                new db.models.PhaseProvince({
                    phaseID: phase.id,
                    provinceKey: province.p,
                    subprovinceKey: null,
                    supplyCentre: province.default ? province.default.power : null,
                    supplyCentreX: province.sc ? province.sc.x : null,
                    supplyCentreY: province.sc ? province.sc.y : null,
                    unitType: province.default && !province.default.sp ? province.default.type : null,
                    unitOwner: province.default && !province.default.sp ? province.default.power : null,
                    unitX: province.x,
                    unitY: province.y
                }).save(null, { transacting: t }).asCallback(parallelCallback);
            },

            function(parallelCallback) {
                if (province.sp) {
                    async.each(province.sp, function(sp, eachEachCallback) {
                        new db.models.PhaseProvince({
                            phaseID: phase.id,
                            provinceKey: province.p,
                            subprovinceKey: sp.p,
                            unitX: sp.x,
                            unitY: sp.y,
                            unitType: province.default && province.default.sp ? province.default.type : null,
                            unitOwner: province.default && province.default.sp ? province.default.power : null
                        }).save(null, { transacting: t }).asCallback(eachEachCallback);
                    }, parallelCallback);
                }
                else {
                    parallelCallback(null);
                }
            }
        ], eachCallback);
    }, cb);
};

PhaseCore.prototype.createFromState = function(variant, game, state, cb) {
    var self = this;
    db.bookshelf.transaction(function(t) {
        async.waterfall([
        ], function(err, result) {
            if (!err) {
                t.commit();
                self.get(game.get('id'), cb);
            }
            else {
                t.rollback();
                cb(err);
            }
        });
    });
    // var PhaseSchema = mongoose.model('Phase'),
    //     indexedProvinces = _.indexBy(phase.toObject().provinces, 'r'),
    //     unit;
    //
    // async.waterfall([
    //     // STEP 1: Mark up old phase, keeping orders intact for posterity.
    //     function(callback) {
    //         var u,
    //             resolution,
    //             resolutionParts;
    //
    //         // Move dislodged units from 'unit' to 'dislodged'.
    //         for (u in state.Dislodgeds()) {
    //             unit = state.Dislodgeds()[u];
    //             indexedProvinces[u].dislodged = {
    //                 power: unit.Nation[0],
    //                 type: unit.Type === 'Fleet' ? 2 : 1
    //             };
    //             winston.debug('Marking %s:%s as dislodged', unit.Nation[0], u, { gameID: game.id.toString() });
    //         }
    //
    //         for (resolution in state.Resolutions()) {
    //             if (state.Resolutions()[resolution]) {
    //                 resolutionParts = resolution.split('/');
    //                 PhaseSchema.getUnitOwnerInProvince(indexedProvinces[resolutionParts[0]]).unit.order.failed = true;
    //                 winston.debug('Marking %s as failed', u, { gameID: game.id.toString() });
    //             }
    //         }
    //
    //         mongoose.model('Phase').findOneAndUpdate(
    //             { '_id': phase.id },
    //             { '$set': {
    //                 'provinces': _.values(indexedProvinces)
    //             } },
    //             callback
    //         );
    //     },
    //
    //     // STEP 2: Create new phase using state's list of units.
    //     function(phase, callback) {
    //         var newPhase = PhaseSchema(),
    //             nextDeadline = moment(),
    //             provinceIndex,
    //             unitIndex,
    //             rComponents,
    //             province,
    //             unit,
    //             godipUnit;
    //         newPhase.game_id = game.id;
    //
    //         // Wipe all units.
    //         for (provinceIndex in indexedProvinces) {
    //             province = PhaseSchema.getUnitOwnerInProvince(indexedProvinces[provinceIndex]);
    //             if (province)
    //                 delete province.unit;
    //         }
    //
    //         // Apply all units returned by godip.
    //         for (unitIndex in state.Units()) {
    //             godipUnit = state.Unit(unitIndex)[0];
    //             unit = {
    //                 type: godipUnit.Type === 'Fleet' ? 2 : 1,
    //                 power: godipUnit.Nation[0]
    //             };
    //             rComponents = unitIndex.split('/');
    //
    //             // Not in a subprovince. Apply unit to topmost level.
    //             if (rComponents.length === 1) {
    //                 indexedProvinces[rComponents[0]].unit = unit;
    //             }
    //             else {
    //                 // In a subprovince. Apply it to the corresponding object in sr: [].
    //                 province = indexedProvinces[rComponents[0]];
    //                 for (provinceIndex = 0; provinceIndex < province.sr.length; provinceIndex++) {
    //                     if (province.sr[provinceIndex].r === rComponents[1]) {
    //                         province.sr[provinceIndex].unit = unit;
    //                         break;
    //                     }
    //                 }
    //             }
    //
    //             winston.debug('%s\'s unit set to %s:%s', unitIndex, unit.power, unit.type);
    //         }
    //
    //         nextDeadline.add(game.getClockFromPhase(game.phase), 'hours');
    //         newPhase.deadline = nextDeadline;
    //         newPhase.provinces = _.values(indexedProvinces);
    //         newPhase.phase = phase.getNextPhasePhase(variant);
    //         newPhase.year = phase.getNextPhaseYear(variant);
    //
    //         // If no dislodges and no adjustments, skip this phase.
    //         if (_.includes(newPhase.phase, 'Retreat') && _.isEmpty(state.Dislodgeds())) {
    //             winston.info('Skipping %s %s phase: no dislodged units', newPhase.phase, newPhase.year, { gameID: game.id });
    //
    //             newPhase.phase = phase.getNextPhasePhase(variant);
    //             newPhase.year = phase.getNextPhaseYear(variant);
    //         }
    //
    //         newPhase.save(callback);
    //     },
    //
    //     function(phase, callback) {
    //         game.phase = phase.phase;
    //         game.year = phase.year;
    //         game.save(callback);
    //     }
    // ], cb);
};

PhaseCore.prototype.setOrder = function(phaseID, data, action, cb) {
    var targetFullName = data[1],
        targetOfTargetFullName = data[2],
        splitTarget = targetFullName ? targetFullName.split('/') : null,
        splitTargetOfTarget = targetOfTargetFullName ? targetOfTargetFullName.split('/') : null,
        target = splitTarget ? splitTarget[0] : null,
        subTarget = splitTarget && splitTarget.length > 1 ? splitTarget[1] : null,
        targetOfTarget = splitTargetOfTarget ? splitTargetOfTarget[0] : null,
        subTargetOfTarget = splitTargetOfTarget && splitTargetOfTarget.length > 1 ? splitTargetOfTarget[1] : null;

    db.models.Phase.update({
        unitAction: action,
        unitTarget: target,
        unitSubTarget: subTarget,
        unitTargetOfTarget: targetOfTarget,
        unitSubTargetOfTarget: subTargetOfTarget
    }).nodeify(cb);
};

module.exports = PhaseCore;