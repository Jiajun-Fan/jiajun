'use strict';

exports = module.exports = function(app, mongoose) {
  require('./schema/User')(app, mongoose);
  require('./schema/Promote')(app, mongoose);
  require('./schema/Group')(app, mongoose);
  require('./schema/GroupTicket')(app, mongoose);
  require('./schema/Discount')(app, mongoose);
};
