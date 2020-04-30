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
