exports.get = function(req, res) {
  req.app.db.models.Group.findById(req.params.id, function(err, group) {
    if (err) {
      res.send({error:err});
    } else {
      if (!group) {
        res.send({error:"no record found"});
      }
      if (group.user.id != req.user.id) {
        res.send({error:"permission denied"})
      } else {
        res.send(group);
      }
    }
  });
}

exports.delete = function(req, res) {
  req.app.db.models.Group.findById(req.params.id, function(err, group) {
    if (err) {
      res.send({error:err});
    } else {
      if (!group) {
        res.send({error:"no record found"});
      }
      if (group.user.id != req.user.id) {
        res.send({error:"permission denied"})
      } else {
        req.app.db.models.Group.findByIdAndRemove(req.params.id, function(){
          res.send({success: "done"});
        });
      }
    }
  });
}

exports.put = function(req, res) {
}
