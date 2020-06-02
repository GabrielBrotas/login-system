const LocalStragery = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../Model/User')

const {checkConfirmEmail} = require('./helpers')

function initialize(passport) {

    passport.use(new LocalStragery({ usernameField: 'email'}, (email, password, done) => {

        User.findOne({where: {email: email}}).then( (user) => {
            
            // se nao achar nenhum usuario...
            if(!user){
                
                // retorna um done(funcao de call back) com 3 parametros (1º os dados da conta que foi autenticada = null pois nenhuma conta foi autenticada, 2º se a autenticacao aconteceu com sucesso ou nao = null pois nao aconteceu e 3º passando uma mensagem )
                return done(null, false, {message: 'Esta conta nao existe'})

            }
                
            // Se a conta existir...
            // comparar a senha digitada com a do banco de dados e passar uma funcao de call back
            bcrypt.compare(password, user.password, (err, match) => {

                // se as senhas forem iguais...
                if(match){

                    var isChecked = checkConfirmEmail(user)

                    if(isChecked){
                        return done(null, user)
                    } else {
                        return done(null, false, {message: 'Por favor, Confirme seu email para logar', email: user.email})
                    }
                    
                } else {
                    return done(null, false, {message: 'senha incorreta'})
                }

            })
        
        })
    }))

    passport.serializeUser((user, done) => done(null, user.id))

    passport.deserializeUser((id, done) => {

        User.findOne({where: {id: id}}).then( (user) => {
            done(null, user)
        })
    })

}

module.exports = initialize