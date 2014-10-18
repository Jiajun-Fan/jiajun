'use strict'

exports.init = function(req, res)  {
  res.render('index', {
    role: "index",
    user: req.user
  });
}
