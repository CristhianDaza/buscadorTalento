const passport = require('passport')

exports.autenticarUsaurio = passport.authenticate('local', {
  successRedirect: '/ok',
  failureRedirect: '/iniciar-sesion',
  failureFlash: true,
  badRequestMessage: 'Ambos campos son obligatorios'
})
