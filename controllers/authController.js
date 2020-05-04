const passport = require('passport')

exports.autenticarUsaurio = passport.authenticate('local', {
  successRedirect: '/ok',
  failureRedirect: '/mal'
})
