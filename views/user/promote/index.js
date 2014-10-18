'use strict';

var form = require("express-form"),
      filter = form.filter,
      validate = form.validate;

exports.create_form = form( // Form filter and validation middleware
      filter("title").trim(),
      validate("title").required("", "请输入标题"),
      filter("contact").trim(),
      validate("contact").required("", "请输入联系人"),
      filter("phone").trim(),
      validate("phone").required("", "请输入联系电话").isNumeric("电话格式错误，请勿包含数字外的字符"),
      filter("descript").trim(),
      validate("descript").required("", "请输入描述"),
      filter("picture").trim(),
      validate("picture").isUrl("图片地址不合法")
);

exports.init = function(req, res){
  res.render('user/promote/index', {
    role: "user",
    subrole: "promote",
    user: req.user
  });
};

exports.create = function(req, res){
  var loads = {role: "user", subrole: "promote", user: req.user};
  var workflow = require("../../../utils").workflow(req, res);
  workflow.on("validateForm", function() {
    var fields = ["title", "descript", "picture", "contact", "phone"];
    if (!req.form.isValid) {
      fields.forEach(function(field){
        if (req.form.getErrors(field).length > 0) {
          loads["err_"+field] = req.form.getErrors(field)[0];
        }
      });
      fields.forEach(function(field) {
        if (req.form.getErrors(field) == 0) {
          loads["val_"+field] = req.form[field];
        }
      });
      res.render('user/promote/index', loads);
    } else {
      workflow.emit("createPromote");
    }
  });

  workflow.on("createPromote", function(){
    var fieldsToSet = {
      title : req.form.title,
      descript : req.form.descript,
      user: {id: req.user.id},
      picture: req.form.picture,
      contact: req.form.contact,
      phone: req.form.phone
    };
    req.app.db.models.Promote.create(fieldsToSet, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      } else {
        res.redirect("/user");
      }
    });
  });

  workflow.emit("validateForm");
};

