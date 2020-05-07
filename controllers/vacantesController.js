const Vacante = require('../models/Vacantes')

exports.formularioNuevaVacante = (req, res) => {
  res.render('nueva-vacante', {
    nombrePagina: 'Nueva Vacante',
    cerrarSesion: true,
    nombre: req.user.nombre,
    tagline: 'Llena el formulario y publica tu vacante'
  })
}

// Agrega la vacante a la base da datos
exports.agregarVacante = async (req, res) => {
  const vacante = new Vacante(req.body)

  // usuario autor de la vante
  vacante.autor = req.user._id

  // Crear arreglo de habilidades (skills)
  vacante.skills = req.body.skills.split(',')

  // almacenarlo en la base dea datos
  const nuevaVacante = await vacante.save()

  //redireccionar
  res.redirect(`/vacantes/${nuevaVacante.url}`)
}


// Muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url }).lean()

  // si no hay resultados
  if(!vacante) return next()

  res.render('vacante', {
    vacante,
    nombrePagina: vacante.titulo,
    barra: true
  })
}


exports.formEditarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url }).lean()

  if(!vacante) return next()

  res.render('editar-vacante', {
    nombrePagina: `Editar - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    vacante
  })
}

exports.editarVacante = async (req, res) => {
  const vacanteActualizada = req.body
  vacanteActualizada.skills = req.body.skills.split(',')

  const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  } ).lean()

  res.redirect(`/vacantes/${vacante.url}`)
}

// Validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
  // sanitizar los campos
  req.sanitizeBody('titulo').escape()
  req.sanitizeBody('empresa').escape()
  req.sanitizeBody('ubicacion').escape()
  req.sanitizeBody('salario').escape()
  req.sanitizeBody('contrato').escape()
  req.sanitizeBody('skills').escape()

  //validar
  req.checkBody('titulo', 'Agrega un Tiulo a la Vacante').notEmpty()
  req.checkBody('empresa', 'Agrega una Empresa a la Vacante').notEmpty()
  req.checkBody('ubicacion', 'Agrega una Ubicacion a la Vacante').notEmpty()
  req.checkBody('salario', 'Agrega un Salario a la Vacante').notEmpty()
  req.checkBody('contrato', 'Agrega un Contrato a la Vacante').notEmpty()
  req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty()

  const errores = req.validationErrors()

  if (errores) {
    // Recargar la vista con los errores
    req.flash('error', errores.map(error => error.msg))
    res.render('nueva-vacante', {
      nombrePagina: 'Nueva Vacante',
      cerrarSesion: true,
      nombre: req.user.nombre,
      tagline: 'Llena el formulario y publica tu vacante',
      mensajes: req.flash()
    })
  }
  next() // siguiente middleware
}

exports.eliminiarVacante = async (req, res) => {
  const { id } = req.params

  res.status(200).send('Vacante eliminada correctamente')

}
