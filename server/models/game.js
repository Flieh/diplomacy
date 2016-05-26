var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('game', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        name: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        description: Sequelize.TEXT,
        variant: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: 'Standard'
        },
        status: {
            type: Sequelize.INTEGER,
            min: 0,
            allowNull: false
        },
        moveClock: {
            type: Sequelize.DECIMAL,
            defaultValue: 24.0,
            allowNull: false,
            field: 'move_clock'
        },
        retreatClock: {
            type: Sequelize.DECIMAL,
            defaultValue: 24.0,
            allowNull: false,
            field: 'retreat_clock'
        },
        adjustClock: {
            type: Sequelize.DECIMAL,
            defaultValue: 24.0,
            allowNull: false,
            field: 'adjust_clock'
        },
        maxPlayers: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'max_players'
        }
    }, {
        underscored: true
    });
};
