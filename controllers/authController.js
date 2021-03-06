const passport = require('passport')
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const Usuarios = mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')

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
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    vacantes
  })
}

exports.cerrarSesion = (req, res) => {
  req.logout()
  req.flash('correcto', 'Sesión cerrada correctamente')
  return res.redirect('/iniciar-sesion')
}

// Forulario para reiniciar el password
exports.formReestablecerPassword = (req, res) => {
  res.render('reestablecer-password', {
    nombrePagina: 'Reestablece tu Contraseña',
    tagline: 'Si ta tienes una cuenta pero olvidaste tu contraseña coloca tu correo electrónico'
  })
}

// Genera el token en la tabla del usuario
exports.enviarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({ email: req.body.email })

  if (!usuario) {
    req.flash('error', 'Correo no válido')
    return res.redirect('/iniciar-sesion')
  }

  // El usuario existe, devolver token
  usuario.token = crypto.randomBytes(20).toString('hex')
  usuario.expira = Date.now() + 3600000

  // Guardar el usaurio
  await usuario.save()
  const resetUrl = `http//${req.headers.host}/reestablecer-password/${usuario.token}`

  // Enviar notificacion por email
  await enviarEmail.enviar({
    usuario,
    subject: 'Password Reset',
    resetUrl,
    archivo: 'reset'
  })
  // todo correcto
  req.flash('correcto', 'Revisa tu email para las indicaciones')
  res.redirect('/iniciar-sesion')
}

// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
    token: req.params.token,
    expira: {
      $gt: Date.now()
    }
  })
  if (!usuario) {
    req.flash('error', 'El formulario ya no es valido')
    return res.redirect('/reestablecer-password')
  }

  // todo bien, mostrar el formulario
  res.render('nuevo-password', {
    nombrePagina: 'Nuevo Password'
  })
}

// almacena el nuevo password en la base de datos
exports.guardarPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
    token: req.params.token,
    expira: {
      $gt: Date.now()
    }
  })

  // no exite el usaurio o el token es invalido
  if (!usuario) {
    req.flash('error', 'El formulario ya no es valido')
    return res.redirect('/reestablecer-password')
  }

  // asignar neuvo password limpiar valores
  usuario.password = req.body.password
  usuario.token = undefined
  usuario.expira = undefined

  // guardar en la base de datos
  await usuario.save()

  //redirigir
  req.flash('correcto', 'Password modificado correctamente')
  res.redirect('/iniciar-sesion')
}
