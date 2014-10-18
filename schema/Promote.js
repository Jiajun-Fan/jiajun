'use strict'

exports = module.exports = function(app, mongoose) {
  var promoteSchema = new mongoose.Schema({
    title: String,
    descript: String,
    picture: String,
    contact: String,
    phone: String,
    user: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    timeCreated: { type: Date, default: Date.now }
  });
  promoteSchema.index({ user: 1 });
  promoteSchema.plugin(require('./plugins/pagedFind'));
  app.db.model('Promote', promoteSchema);
};
