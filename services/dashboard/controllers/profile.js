'use strict';

exports.view = function(req, res) {
  res.render('profile');
};

exports.edit = function(req, res) {
  if (!(req.body.passwordOld && req.body.passwordNew && req.body.passwordRepeat)) {
    return res.status(400).render('profile', { error: 'All fields are required' });
  }

  if (req.body.passwordOld !== req.user.password) {
    return res.status(400).render('profile', { error: 'Old password is incorrect' });
  }

  if (req.body.passwordNew !== req.body.passwordRepeat) {
    return res.status(400).render('profile', { error: 'New password and password repeat do not match' });
  }

  req.user.password = req.body.passwordNew;
  req.user.defaultCredentials = false;

  req.user.save()
    .then(() => res.redirect(req.app.locals.rootPath));
};