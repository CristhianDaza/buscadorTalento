const passport = require('passport')

exports.autenticarUsaurio = passport.authenticate('local', {
  successRedirect: '/administracion',
  failureRedirect: '/iniciar-sesion',
  failureFlash: true,
  badRequestMessage: 'Ambos campos son obligatorios'
})

exports.mostrarPanel = (req, res) => {
  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    tagline: 'Crea y adminitrista tus vacantes desde aquí'
  })
}
