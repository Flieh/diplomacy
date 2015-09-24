var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
}, { strict: false, _id: false });

var SeasonSchema = new mongoose.Schema({
    game_id: mongoose.Schema.Types.ObjectId,
    year: Number,
    season: String,
    regions: [ OrderSchema ]
});

var Season = mongoose.model('Season', SeasonSchema);

module.exports = {
  Season: Season
};
