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

exports.validarRegistro = (req, res, next) => {
  //sanitizar
  req.sanitizeBody('nombre').escape()
  req.sanitizeBody('email').escape()
  req.sanitizeBody('password').escape()
  req.sanitizeBody('confirmar').escape()

  // validar
  req.checkBody('nombre', 'El nombre es obligatorio').notEmpty()
  req.checkBody('email', 'El email debe ser valido').isEmail()
  req.checkBody('password', 'La contraseña es obligatorio').notEmpty()
  req.checkBody('confirmar', 'Confirmar contraseña es obligatorio').notEmpty()
  req.checkBody('confirmar', 'La contraseña es diferente').equals(req.body.password)

  const errores = req.validationErrors()

  if (errores) {
    // si no hay errores
    req.flash('error', errores.map(error => error.msg))
    res.render('crear-cuenta', {
      nombrePagina: 'Crea tu cuenta en vevJobs',
      tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
      mensajes: req.flash()
    })
    return
  }

  // si toda la validación es correcta
  next()
}
