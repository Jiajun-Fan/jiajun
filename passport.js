'use strict';

exports = module.exports = function(app, passport) {
  var LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(username, password, done) {
      var conditions = { isActive: 'active' };
        conditions.email = username;

      app.db.models.User.findOne(conditions, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, { message: '用户不存在' });
        }

        var encryptedPassword = app.db.models.User.encryptPassword(password);
        if (user.password !== encryptedPassword) {
          return done(null, false, { message: '密码错误' });
        }

        return done(null, user);
      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    app.db.models.User.findById(id, function(err, user) {
      done(null, user);
    });
  });
};
