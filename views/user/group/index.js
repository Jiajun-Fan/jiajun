'use strict';

var form = require("express-form"),
      filter = form.filter,
      validate = form.validate;

exports.create_form = form( // Form filter and validation middleware
      filter("title").trim(),
      validate("title").required("", "请输入标题"),
      filter("product").trim(),
      validate("product").required("", "请输入产品或店铺名称"),
      filter("address").trim(),
      validate("address").required("", "请输入地址"),
      filter("start").trim(),
      validate("start").required("", "请输入开始日期").isNumeric("非法日期格式"),
      filter("start").toInt(),
      filter("end").trim(),
      validate("end").required("", "请输入结束日期").isNumeric("非法日期格式"),
      filter("end").toInt(),
      filter("origin").trim(),
      validate("origin").required("", "请输入原价").isNumeric("非法价格"),
      filter("origin").toFloat(),
      filter("sale").trim(),
      validate("sale").required("", "请输入现价").isNumeric("非法价格"),
      filter("sale").toFloat(),
      filter("phone").trim(),
      validate("phone").required("", "请输入联系电话").isNumeric("电话格式错误，请勿包含数字外的字符"),
      filter("descript").trim(),
      validate("descript").required("", "请输入描述")
);

exports.init = function(req, res){
  res.render('user/group/index', {
    role: "user",
    subrole: "group",
    user: req.user
  });
};

exports.create = function(req, res){
  var loads = {role: "user", subrole: "group", user: req.user};
  var workflow = require("../../../utils").workflow(req, res);
  workflow.on("validateForm", function() {
    var fields = ["title", "descript", "product", "address", "start", "end", "origin", "sale", "phone"];
    var valid = true;
    if (req.form.start >= req.form.end) {
      valid = false;
      loads.err_start = "开始时间必须早于结束时间";
    }
    if (req.form.sale === 0) {
      valid = false;
      loads.err_sale = "不能白送";
    }
    if (req.form.sale >= req.form.origin) {
      valid = false;
      loads.err_sale = "必须打折";
    }
    if (!req.files || !req.files.picture) {
      valid = false;
      loads.err_picture = "请上传图片";
    }
    if (!valid || !req.form.isValid) {
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
      res.render('user/group/index', loads);
    } else {
      workflow.emit("savePicture");
    }
  });

  workflow.on("savePicture", function(){
    var rand = require("crypto").randomBytes(4).toString("hex");
    var index = req.files.picture.path.lastIndexOf(".");
    var ext = "png";
    if (index !== -1) {
      ext = req.files.picture.path.substring(index+1);
    }
    var date = Date.parse(new Date());  
    var name = __dirname + "/../../../public/uploads/" + date + rand + "." + ext;
    require("fs").rename(req.files.picture.path, name, function(err){
      workflow.picture = "/uploads/" + date + rand + "." + ext;
      workflow.emit("createGroup");
    });
  });

  workflow.on("createGroup", function(){
    var fieldsToSet = {
      title : req.form.title,
      descript : req.form.descript,
      user: {id: req.user.id},
      picture: workflow.picture,
      product: req.form.product,
      start: req.form.start,
      end: req.form.end,
      origin: req.form.origin,
      sale: req.form.sale,
      phone: req.form.phone,
      discount: req.form.sale/req.form.origin
    };
    req.app.db.models.Group.create(fieldsToSet, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      } else {
        res.redirect("/user");
      }
    });
  });

  workflow.emit("validateForm");
};

