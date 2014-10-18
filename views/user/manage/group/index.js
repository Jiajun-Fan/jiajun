'use strict'

exports.init = function(req, res) {

  var workflow = require("../../../../utils").workflow(req, res);

  req.query.limit = req.query.limit ? req.query.limit : 20;
  req.query.page = req.query.page ? req.query.page : 1;
  req.query.sort = req.query.sort ? req.query.sort : "_id";

  workflow.on("query", function(done) {
    req.app.db.models.Group.pagedFind({
      filters : {'user.id' : req.user.id},
      limit : req.query.limit,
      page : req.query.page,
      sort : req.query.sort,
    }, function(err, results){
      if (err) {
        return workflow.emit('exception', err);
      }
      res.render('user/manage/group/index', {
        results : results,
        role : "user",
        user : req.user
      });
    });
  });

  workflow.emit("query");
};
