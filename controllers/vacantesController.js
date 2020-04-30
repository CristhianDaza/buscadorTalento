const Vacante = require('../models/Vacantes')

exports.formularioNuevaVacante = (req, res) => {
  res.render('nueva-vacante', {
    nombrePagina: 'Nueva Vacante',
    tagline: 'Llena el formulario y publica tu vacante'
  })
}

// Agrega la vacante a la base da datos
exports.agregarVacante = async (req, res) => {
  const vacante = new Vacante(req.body)

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
