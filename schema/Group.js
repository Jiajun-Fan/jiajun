'use strict'

exports = module.exports = function(app, mongoose) {
  var groupSchema = new mongoose.Schema({
    title: String,
    product: String,
    address: String,
    start: Number,
    end: Number,
    origin: Number,
    sale: Number,
    phone: String,
    descript: String,
    picture: String,
    user: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    discount: Number,
    timeCreated: { type: Date, default: Date.now }
  });
  groupSchema.index({ user: 1 });
  groupSchema.plugin(require('./plugins/pagedFind'));
  app.db.model('Group', groupSchema);
};
