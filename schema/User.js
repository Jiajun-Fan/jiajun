'use strict'

exports = module.exports = function(app, mongoose) {
  var userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    isActive: String,
    roles: String,
    timeCreated: { type: Date, default: Date.now }
  });
  userSchema.statics.encryptPassword = function(password) {
    return require('crypto').createHmac('sha512', app.get('crypto-key')).update(password).digest('hex');
  };
  userSchema.index({ email: 1 }, { unique: true });
  userSchema.plugin(require('./plugins/pagedFind'));
  app.db.model('User', userSchema);
};
