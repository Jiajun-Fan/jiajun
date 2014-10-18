'use strict'

exports = module.exports = function(app, mongoose) {
  var discountSchema = new mongoose.Schema({
    title: String,
    descript: String,
    picture: String,
    contact: String,
    phone: String,
    discount: Number,
    user: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    timeCreated: { type: Date, default: Date.now }
  });
  discountSchema.index({ user: 1 });
  app.db.model('Discount', discountSchema);
};
