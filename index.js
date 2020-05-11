const mongoose = require('mongoose')
require('./config/db')

const express = require('express')
const exhbs = require('express-handlebars')
const path = require('path')
const router = require('./routes')
require('dotenv').config({ path: './variables.env' })
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const createError = require('http-errors')

const passport = require('./config/passport')

const app = express()

// habilitar bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Validacion de campos
app.use(expressValidator())

// Habilitar handlebar como view
app.engine('handlebars',
  exhbs({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
  })
)

app.set('view engine', 'handlebars')

// static files
app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())

app.use(session({
  secret: process.env.SECRETO,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

//Inicializar passport
app.use(passport.initialize())
app.use(passport.session())

// Alertas y flash messages
app.use(flash())

// Crear nuestro middleware
app.use((req, res, next) => {
  res.locals.mensajes = req.flash()
  next()
})

app.use('/', router())

// 404 pagina no existente
app.use((req, res, next) => {
  next(createError(404, 'No encontrado'))
})

// Administracion de los errores
app.use((error, req, res, next) => {
  res.locals.mensaje = error.message
  const status = error.status || 500
  res.locals.status = status
  res.status(status)
  res.render('error', {
    nombrePagina: 'Error'
  })
})

// Dejar que heroku asigen el puerto
const host = '0.0.0.0'
const port = process.env.PORT
app.listen(port, host, () => {
  console.log('El servidor esta funcionando');

})
