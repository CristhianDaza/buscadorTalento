const Vacante = require('../models/Vacantes')
const multer = require('multer')
const shortid = require('shortid')

exports.formularioNuevaVacante = (req, res) => {
  res.render('nueva-vacante', {
    nombrePagina: 'Nueva Vacante',
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
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
  const vacante = await Vacante.findOne({ url: req.params.url }).lean().populate('autor')

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
    imagen: req.user.imagen,
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

  const vacante = await Vacante.findById(id)

  if(verificarAutor(vacante, req.user)) {
    // Si es el usuario, eliminar
    vacante.remove()
    res.status(200).send('Vacante eliminada correctamente')
  } else {
    // no permitido
    res.status(403).send('Error')
  }
}

const verificarAutor = (vacante = {}, usuario = {}) => {
  if (!vacante.autor.equals(usuario._id)) {
    return false
  }
  return true
}

// Subir archivos en PDF
exports.subirCV = (req, res, next) => {
  upload(req, res, function(error) {
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'El archvio es muy grande; máximo 200kb')
        } else {
          req.flash('error', error.message)
        }
      } else {
        req.flash('error', error.message)
      }
      res.redirect('back')
      return
    } else {
      return next()
    }
  })
}

//opciones de multer
const configuracionMulter = {
  limits: { fileSize: 200000 },
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+'../../public/uploads/cv')
    },
    filename: (req, file, cb) => {
      const extencion = file.mimetype.split('/')[1]
      cb(null, `${shortid.generate()}.${extencion}`)
    }
  }),
  fileFilter(req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Formato no válido'), false)
    }
  }
}

const upload = multer(configuracionMulter).single('cv')

// almacenar los candidatos en la bd
exports.contactar = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url })

  // sino existe la vacante
  if (!vacante) return next()

  // todo bien construir el nuevo objeto
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename
  }

  // almacenar la vacante
  vacante.candidatos.push(nuevoCandidato)
  await vacante.save()

  // mensaje flash y redireccion
  req.flash('correcto', 'Se envió tu Corriculum correctamente')
  res.redirect('/')
}
