const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')

 passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  }, async (email, password, done) => {
    const usaurio = await Usuarios.findOne({ email })

    if (!usaurio) return done(null, false, {
      message: 'Usarui no existente'
    })

    // El usuariuo existe, vamos a verificarlo
    const verificarPass = usaurio.compararPassword(password)

    if (!verificarPass) return done(null, false, {
      message: 'Contraseña Incorrecta'
    })

    // Usuario exite y password correcto
    return done(null, usuario)
}))

passport.serializeUser((usuario, done) => done(null, usuario._id))

passport.deserializeUser(async (id, done) => {
  const usuario = await Usuarios.findById(id).exec()
  return done(null, usuario)
})

module.exports = passport
