exports.get = function(req, res) {
  req.app.db.models.Promote.findById(req.params.id, function(err, promote) {
    if (err) {
      res.send({error:err});
    } else {
      if (!promote) {
        res.send({error:"no record found"});
      }
      if (promote.user.id != req.user.id) {
        res.send({error:"permission denied"})
      } else {
        res.send(promote);
      }
    }
  });
}

exports.delete = function(req, res) {
  req.app.db.models.Promote.findById(req.params.id, function(err, promote) {
    if (err) {
      res.send({error:err});
    } else {
      if (!promote) {
        res.send({error:"no record found"});
      }
      if (promote.user.id != req.user.id) {
        res.send({error:"permission denied"})
      } else {
        req.app.db.models.Promote.findByIdAndRemove(req.params.id, function(){
          res.send({success: "done"});
        });
      }
    }
  });
}

exports.put = function(req, res) {
}
