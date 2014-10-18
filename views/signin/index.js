'use strict';

var form = require("express-form"),
      filter = form.filter,
      validate = form.validate;

exports.login_form = form( // Form filter and validation middleware
      filter("email").trim(),
      validate("email").required("请输入您的邮箱").isEmail("邮箱地址不合法"),
      filter("password").trim(),
      validate("password").required("请输入您的密码")
);

exports.init = function(req, res){
  if (req.isAuthenticated()) {
    if (req.query.returnUrl) {
      res.redirect(req.query.returnUrl);
    } else {
      res.redirect('/user');
    }
  }
  else {
    res.render('signin/index', {
      retUrl: req.query.returnUrl,
      role: "login"
    });
  }
};

exports.signin = function(req, res){
  var loads = {role: "login"};
  var workflow = require("../../utils").workflow(req, res);
  workflow.on("validateForm", function() {
    var fields = ["email", "password"];
    if (!req.form.isValid) {
      fields.forEach(function(field){
        if (req.form.getErrors(field).length > 0) {
          loads["err_"+field] = req.form.getErrors(field)[0];
        }
      });
      if (req.form.getErrors("email") == 0) {
        loads["val_email"] = req.form.email;
      }
      res.render('signin/index', loads);
    } else {
      workflow.emit("validateUser");
    }
  });

  workflow.on("validateUser", function(){
    req._passport.instance.authenticate('local', function(err, user, msg){
      if (err) {
        return workflow.emit('exception', err);
      }
      if (!user) {
        loads.err_email = msg.message;
        res.render('signin/index', loads);
      } else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

          if (req.query.returnUrl) {
            res.redirect(req.query.returnUrl);
          } else {
            res.redirect('/user');
          }
        });
      }
    })(req, res);
  });

  workflow.emit("validateForm");
};

exports.logout = function(req, res) {
  if (req.isAuthenticated()) {
    req.logout();
  }
  res.redirect('/');
}
