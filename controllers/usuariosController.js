const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')
const multer = require('multer')
const shortid = require('shortid')

exports.subirImagen = (req, res, next) => {
  upload(req, res, function(error) {
   if (error instanceof multer.MulterError) {
     return next()
   }
  })
  next()
}

//opciones de multer
const configuracionMulter = {
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+'../../public/uploads/perfiles')
    },
    filename: (req, file, cb) => {
      const extencion = file.mimetype.split('/')[1]
      cb(null, `${shortid.generate()}.${extencion}`)

    }
  })
}

const upload = multer(configuracionMulter).single('imagen')

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

// sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = async (req, res, next) => {
  // sanitizar
  req.sanitizeBody('nombre').escape()
  req.sanitizeBody('email').escape()
  if (req.body.password) {
    req.sanitizeBody('password').escape()
  }

  // validar
  req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty()
  req.checkBody('email', 'El correo no puede ir vacio').notEmpty()

  const errores = req.validationErrors()

  if (errores) {
    const usuarios = await Usuarios.findOne({ nombre: req.user.nombre }).lean()
    req.flash('error', errores.map(error => error.msg))
    res.render('editar-perfil', {
      nombrePagina: 'Edita tu perfil en devJobs',
      cerrarSesion: true,
      nombre: req.user.nombre,
      usuarios,
      mensajes: req.flash()
    })
  }
  next() // todo bien, siguiente middleware
}

