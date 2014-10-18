'use strict'

exports.init = function(req, res) {

  var outcome = {};
  var collections = ['Promote', 'Group', 'Discount'];
  var queries = [];
  collections.forEach(function(el, i, arr){
    queries.push(function(done){
      req.app.db.models[el].count({'user.id':req.user.id}, function(err, count){
        if (err) {
          return done(err, null);
        }

        outcome['count'+el] = count;
        done(null, err);
      });
    });
  });

  var getPromoteData = function() {
    req.app.db.models.Promote.find
  }

  var asyncFinally = function(err, results) {

    if (err) {
      return workflow.emit('exception', err);
    }

    res.render('user/index', {
      outcome: outcome,
      role: "user",
      user: req.user
    });
  };

  require('async').parallel(queries, asyncFinally);
};
