const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')

exports.formCrearCuenta = (req, res) => {
  res.render('crear-cuenta', {
    nombrePagina: 'Crea tu cuenta en vevJobs',
    tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
  })
}

exports.crearUsuario = async (req, res, next) => {
  // Crear usurio
  const usuario = new Usuarios(req.body)

  const nuevoUsuario = await usuario.save()

  if(!nuevoUsuario) return next()

  res.redirect('/iniciar-sesion')
}
