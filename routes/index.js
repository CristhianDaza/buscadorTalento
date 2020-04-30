const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeController')
const vacantesController = require('../controllers/vacantesController')

module.exports = () => {
  router.get('/', homeController.mostrarTrabajos)

  // Crear Vacantes
  router.get('/vacantes/nueva', vacantesController.formularioNuevaVacante)

  router.post('/vacantes/nueva', vacantesController.agregarVacante)

  return router
}
