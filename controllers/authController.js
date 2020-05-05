const passport = require('passport')

exports.autenticarUsaurio = passport.authenticate('local', {
  successRedirect: '/administracion',
  failureRedirect: '/iniciar-sesion',
  failureFlash: true,
  badRequestMessage: 'Ambos campos son obligatorios'
})

// Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {
  // revisa usaurio
  if (req.isAuthenticated()) {
    return next() // estan autenticados
  }

  // si no se redireccionan
  res.redirect('/iniciar-sesion')
}

exports.mostrarPanel = (req, res) => {
  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    tagline: 'Crea y adminitrista tus vacantes desde aquí'
  })
}
