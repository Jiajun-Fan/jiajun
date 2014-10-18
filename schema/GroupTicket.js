'use strict'

exports = module.exports = function(app, mongoose) {
  var groupTicketSchema = new mongoose.Schema({
    secret : String,
    group : {
      id: {type: mongoose.Schema.Types.ObjectId, ref: 'Group'}
    }
  });
  groupTicketSchema.index({group: 1});
  groupTicketSchema.index({secret: 1});
  app.db.model('GroupTicket', groupTicketSchema);
};
