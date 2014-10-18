'use strict';

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  res.redirect('/signin?returnUrl='+ encodeURIComponent(req.originalUrl));
}

function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  res.redirect('/');
}

function ensureAccount(req, res, next) {
  if (req.user.canPlayRoleOf('account')) {
    if (req.app.get('require-account-verification')) {
      if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
        return res.redirect('/account/verification/');
      }
    }
    return next();
  }
  res.redirect('/');
}

exports = module.exports = function(app, passport) {
  app.get('/', require('./views/index').init);
  app.get('/signup', require('./views/signup/index').init);
  app.post('/signup', require('./views/signup/index').reg_form, require('./views/signup/index').signup);
  app.get('/signin', require('./views/signin/index').init);
  app.post('/signin', require('./views/signin/index').login_form, require('./views/signin/index').signin);
  app.get('/logout', require('./views/signin/index').logout);

  app.get('/mobile', require('./views/wap/index').init);
  
  app.all('/user*', ensureAuthenticated);
  app.get('/user', require('./views/user/index').init);

  app.get('/user/promote', require('./views/user/promote/index').init);
  app.post('/user/promote', require('./views/user/promote/index').create_form, require('./views/user/promote/index').create);
  app.get('/user/group', require('./views/user/group/index').init);
  app.post('/user/group', require('./views/user/group/index').create_form, require('./views/user/group/index').create);

  app.get('/user/manage/promote', require('./views/user/manage/promote/index').init);
  app.get('/user/manage/group', require('./views/user/manage/group/index').init);

  app.get('/user/json/promote/query/:id', require('./views/user/json/promote').get);
  app.get('/user/json/promote/delete/:id', require('./views/user/json/promote').delete);
  app.get('/user/json/group/query/:id', require('./views/user/json/group').get);
  app.get('/user/json/group/delete/:id', require('./views/user/json/group').delete);

  app.get('/api', require('./views/api/index').verify);
  app.post('/api', require('./utils').weiXinParser, require('./views/api/index').verify);

};
