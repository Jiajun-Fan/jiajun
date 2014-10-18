'use strict';

var form = require("express-form"),
      filter = form.filter,
      validate = form.validate;

exports.reg_form = form( // Form filter and validation middleware
      filter("email").trim(),
      validate("email").required("", "请输入您的邮箱").isEmail("邮箱地址不合法"),
      filter("password").trim(),
      validate("password").required("", "请输入您的密码"),
      filter("confirm").trim(),
      validate("confirm").required("", "请确认您的密码").equals("field::password", "两次输入的密码不一致"),
      filter("agree").trim(),
      validate("agree").required("", "请同意用户协议")
);

exports.init = function(req, res){
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  else {
    res.render('signup/index', {
      role: "login"
    });
  }
};

exports.signup = function(req, res){
  var loads = {role:"login"};
  var workflow = require("../../utils").workflow(req, res);
  workflow.on("validateForm", function() {
    var fields = ["email", "password", "confirm", "agree"];
    if (!req.form.isValid) {
      console.log(req.form.agree);
      fields.forEach(function(field){
        if (req.form.getErrors(field).length > 0) {
          loads["err_"+field] = req.form.getErrors(field)[0];
        }
      });
      if (req.form.getErrors("email") == 0) {
        loads["val_email"] = req.form.email;
      }
      res.render('signup/index', loads);
    } else {
      workflow.emit("validateUser");
    }
  });

  workflow.on("validateUser", function(){
    req.app.db.models.User.findOne({"email": req.form.email}, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }
        if (user) {
          loads["err_email"] = "这个邮箱已被注册";
          res.render('signup/index', loads);
        }
        workflow.emit("createUser");
    });
  });

  workflow.on("createUser", function(){
    var fieldsToSet = {
      email : req.form.email,
      password : req.app.db.models.User.encryptPassword(req.form.password),
      isActive : "active",
      roles : "normal",
    }
    req.app.db.models.User.create(fieldsToSet, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      } else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }
          res.redirect('/user');
       });
      }
    });
  });

  workflow.emit("validateForm");
};
