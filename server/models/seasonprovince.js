var Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('season_province', {
        seasonID: {
            type: Sequelize.UUID,
            primaryKey: true,
            field: 'season_id',
            notNull: true
        },
        provinceKey: {
            type: Sequelize.TEXT,
            field: 'province_key',
            primaryKey: true,
            notNull: true
        },
        subProvinceKey: {
            type: Sequelize.TEXT,
            field: 'subprovince_key',
            primaryKey: true
        },
        isFailed: {
            field: 'is_failed',
            type: Sequelize.BOOLEAN,
            default: false
        }
    }, {
        underscored: true
    });
};
