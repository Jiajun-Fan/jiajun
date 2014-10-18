'use strict';

exports.port = process.env.PORT || 80;
exports.mysite = "http://115.28.175.183";
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/jiajun'
};
exports.companyName = 'AllesWell';
exports.projectName = 'AllesWell';
exports.subtitle = '美好世界 从今天开始';
exports.systemEmail = 'auto@jiajun.me';
exports.cryptoKey = 'topSecret001';
exports.requireAccountVerification = false;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName +' Website',
    address: process.env.SMTP_FROM_ADDRESS || 'auto@jiajun.me'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'auto@jiajun.me',
    password: process.env.SMTP_PASSWORD || 'fjj30891',
    host: process.env.SMTP_HOST || 'mail.jiajun.me',
    tls: true,
    port: 25
  }
};
