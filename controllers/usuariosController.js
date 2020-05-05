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

  try {
    await usuario.save()
    res.redirect('/iniciar-sesion')
  } catch (error) {
    req.flash('error', error)
    res.redirect('/crear-cuenta')
  }

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

// Crear formualrio para iniciar sesion
exports.fornIniciarSesion = (req, res) => {
  res.render('iniciar-sesion', {
    nombrePagina: 'Iniciar Sesión devJobs'
  })
}

// Form editar el Perfil
exports.formEditarPerfil = async (req, res) => {
  const usuarios = await Usuarios.findOne({ nombre: req.user.nombre }).lean()

  res.render('editar-perfil', {
    nombrePagina: 'Edita tu perfil en devJobs',
    cerrarSesion: true,
    nombre: req.user.nombre,
    usuarios
  })
}

// guarda cambios editar perfil
exports.editarPerfil = async (req, res) => {
  const usuario = await Usuarios.findById(req.user._id)

  usuario.nombre = req.body.nombre
  usuario.email = req.body.email
  if (req.body.password) {
    usuario.password = req.body.password
  }
  await usuario.save()

  req.flash('correcto', 'Cambios guardados Correctamente')

  // redirect
  res.redirect('/administracion')
}
