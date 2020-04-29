const express = require('express')

const app = express()

app.use('/', (req, res) => {
  res.send('Iniciando')
})

app.listen(5000)
