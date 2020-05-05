const passport = require('passport')
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')

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

exports.mostrarPanel = async (req, res) => {

  // consultar el usaurio autenticado
  const vacantes = await Vacante.find({ autor: req.user._id }).lean()

  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    tagline: 'Crea y adminitrista tus vacantes desde aquí',
    vacantes
  })
}
