'use strict';

exports.verify = function(req, res) {
  var workflow = require("../../utils").workflow(req, res);
  workflow.formatOutput = function(to, from, create, type, content) {
    res.contentType('application/xml');
    var ret = '<xml>';
    ret += "<ToUserName><![CDATA[" + to + "]]></ToUserName>";
    ret += "<FromUserName><![CDATA[" + from + "]]></FromUserName>";
    ret += "<CreateTime>" + create + "</CreateTime>";
    ret += "<MsgType><![CDATA[" + type + "]]></MsgType>";
    ret += "<Content><![CDATA[" + content + "]]></Content>";
    ret += "</xml>";
    res.send(ret);
  };

  workflow.formatNews = function(article) {
    res.contentType('application/xml');
    var ret = '<xml>';
    ret += "<ToUserName><![CDATA[" + req.body.FromUserName + "]]></ToUserName>";
    ret += "<FromUserName><![CDATA[" + req.body.ToUserName + "]]></FromUserName>";
    ret += "<CreateTime>" + req.body.CreateTime + "</CreateTime>";
    ret += "<MsgType><![CDATA[news]]></MsgType>";
    ret += "<ArticleCount>" + article.length + "</ArticleCount>";
    ret += "<Articles>";
    for (var i=0; i<article.length; i++) {
      ret += "<item>";
      ret += "<Title><![CDATA[" + article[i].title + "]]></Title>";
      ret += "<Description><![CDATA[" + article[i].description + "]]></Description>";
      ret += "<PicUrl><![CDATA[" + article[i].pic + "]]></PicUrl>";
      ret += "<Url><![CDATA[" + article[i].url+ "]]></Url>";
      ret += "</item>";
    }
    ret += "</Articles>";
    ret += "</xml>";
    res.send(ret);
  };

  workflow.on('checkType', function() {
    workflow.type = req.body.MsgType;
    if (!req.body.Content) {
      workflow.content = "nothing";
    } else {
      workflow.content = req.body.Content;
    }
    if (workflow.type !== "text") {
      workflow.formatOutput(req.body.FromUserName, req.body.ToUserName, req.body.CreateTime, 
            "text", "暂不支持~");
    } else {
      workflow.emit('checkContent');
    }
  });

  workflow.on('checkContent', function() {
    if (workflow.content === "tg" || workflow.content === "推广") {
      req.app.db.models.Promote.find().sort()({}, function(err, promote) {
        if (err) {
          workflow.formatOutput(req.body.FromUserName, req.body.ToUserName, req.body.CreateTime, "text", "出错了!");
        } else {
          workflow.formatNews([{
            title: promote.title,
            description: promote.descript,
            pic : promote.picture,
            url : req.app.get("mysite") + "/mobile/promote?id=" + promote.id
          }]);
        }
      });
    } else if (workflow.content === "group" || "团购"){
      req.app.db.models.Group.findOne({}, function(err, group) {
        if (err) {
          workflow.formatOutput(req.body.FromUserName, req.body.ToUserName, req.body.CreateTime, "text", "出错了!");
        } else {
          workflow.formatNews([{
            title: group.title + "原价:" + group.origin + ", 现价:" + group.sale + ", " + Math.floor(group.discount * 100).toString() + "折",
            description: group.descript,
            pic : req.app.get("mysite") + group.picture,
            url: req.app.get("mysite") + "/mobile/group?id=" + group.id
          }]);
        }
      });
    } else if(/yh([0-9,a-f]{32})q/.test(workflow.content)) {
      workflow.enstr = RegExp.$1;
      workflow.emit('decrypt');
    } else if(workflow.content === "qrcode") {
      workflow.formatNews([{
        title : "海底捞火锅代金券",
        description : "海底捞火锅代金券100元，售价85元",
        pic : "http://115.28.175.183/qrcode",
        url : "http://115.28.175.183/ref"
      }]);
    } else {
      workflow.formatOutput(req.body.xml.FromUserName, req.body.xml.ToUserName, req.body.xml.CreateTime, 
            "text", "BAD~");
    }
  });

  workflow.on('encrypt', function() {
    var cipher = require("crypto").createCipher('aes-128-cbc', 'fjj30891'); 
    var ret = cipher.update("验证成功", "utf8", "hex");
    ret += cipher.final("hex");
    workflow.formatOutput(req.body.xml.FromUserName, req.body.xml.ToUserName, req.body.xml.CreateTime, 
          "text", 'yh'+ret+'q');
  });

  workflow.on('decrypt', function() {
    var decipher = require("crypto").createDecipher('aes-128-cbc', 'fjj30891'); 
    decipher.update(workflow.enstr, "hex", "utf8");
    var ret = decipher.final("utf8");
    workflow.formatOutput(req.body.xml.FromUserName, req.body.xml.ToUserName, req.body.xml.CreateTime, 
          "text", ret);
  });

  workflow.emit('checkType');
};

exports.ref = function(req, res) {
  var decipher = require("crypto").createDecipher('aes-128-cbc', 'fjj30891'); 
  decipher.update(req.query.ref, "hex", "utf8");
  res.render('api/index', {
    ref_user : decipher.final("utf8")
  });
};
