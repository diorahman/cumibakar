var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var UserSchema = new Schema({
    id : String,
    profile : {},
    timestamp : Date,
    features : [{ type: Schema.Types.ObjectId, ref: 'Feature' }]
});

module.exports = mongoose.model('User', UserSchema);