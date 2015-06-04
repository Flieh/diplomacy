'use strict';

var seekrits;
try {
    seekrits = require('../config/local.env');
}
catch (ex) {
    if (ex.code === 'MODULE_NOT_FOUND')
        seekrits = require('../config/local.env.sample');
}

module.exports = function() {
    var app = this.app,
        core = this.core;

    app.io.route('game', {
        userlist: function(req, res) {
            var options = { playerID: req.data.playerID };
            var games = core.game.list(options, function(err, games) {
                return res.json(games);
            });
        },

        list: function(req, res) {
            var games = core.game.list({ }, function(err, games) {
                return res.json(games);
            });
        },

        listopen: function(req, res) {
            var games = core.game.listOpen({ }, function(err, games) {
                return res.json(games);
            });
        },

        moves: function(req, res) {
        },

        join: function(req, res) {
            // make sure this person is actually allowed to join

            // join

            // broadcast join to others subscribed to game

        }
    });
};
