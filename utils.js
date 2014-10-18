'use strict'

exports.weiXinParser = function(req, res, next) {
  var utils = require('express/node_modules/connect/lib/utils');
  if (req._body) return next();
  req.body = req.body || {};

  // ignore GET
  if ('GET' == req.method || 'HEAD' == req.method) return next();
 
  // check Content-Type
  if ('text/xml' != utils.mime(req)) return next();
 
  // flag as parsed
  req._body = true;

  var sfields = ["ToUserName", "FromUserName", "MsgType", "Content"];
  var ifields = ["CreateTime"];

  var json = {};
  var buf = '';

  req.setEncoding('utf8');
  req.on('data', function(chunk){ buf += chunk });
  req.on('end', function(){  

    sfields.forEach(function(field) {
      var restr = "<" + field + "><!\\[CDATA\\[(.*)\\]\\]></" + field + ">";
      var re = new RegExp(restr, "g");
      var result = re.exec(buf);
      if (result) {
        json[field]  = result[1];
      }
    });

    ifields.forEach(function(field) {
      var restr = "<" + field + ">(.*)</" + field + ">";
      var re = new RegExp(restr, "g");
      var result = re.exec(buf);
      if (result) {
        json[field]  = result[1];
      }
    });

    req.body = json;
    next();
  });
};

exports.workflow = function(req, res) {
  var workflow = new (require('events').EventEmitter)();
  workflow.outcome = {
    success: false,
    errors: [],
    errfor: {}
  };

  workflow.hasErrors = function() {
    return Object.keys(workflow.outcome.errfor).length !== 0 || workflow.outcome.errors.length !== 0;
  };

  workflow.on('exception', function(err) {
    workflow.outcome.errors.push('Exception: '+ err);
    return workflow.emit('response');
  });

  workflow.on('response', function() {
    workflow.outcome.success = !workflow.hasErrors();
    res.send(workflow.outcome);
  });

  return workflow;
};
