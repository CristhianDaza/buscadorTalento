const express = require('express')
const exhbs = require('express-handlebars');
const router = require('./routes')

const app = express()

// Habilitar handlebar como view
app.engine('handlebars',
  exhbs({
    defaultLayout: 'layout'
  })
)

app.set('view engine', 'handlebars')

app.use('/', router())

app.listen(5000)
