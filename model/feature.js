var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var FeatureSchema = new Schema({
    id : Number,
    geometry : {
      "type" : { type : String},
      coordinates : [Number]
    },
    properties : {},
    _creator : { type: Schema.Types.ObjectId, ref: 'User' }
    
});

module.exports = mongoose.model('Feature', FeatureSchema);