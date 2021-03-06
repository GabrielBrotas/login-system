// modules
const express = require('express')
const app = express()
const BodyParser = require('body-parser')

const bcrypt = require('bcryptjs')
const randomstring = require('randomstring') // gerar token aleatorio
//https://github.com/klughammer/node-randomstring

// sessao e autenticacao
    const passport = require('passport') // pacote de autenticacao
    const session = require('express-session') // Carregar o modulo de sessions para guardar o usuario que esta logado
    require('./Control/configs/passport-config')(passport) // passar o passport para o arquivo passport-config
    const flash = require('express-flash') // mostrar mensagem de erro flash

// helpers
    const {checkAuthenticated, checkisNotAuthenticated} = require('./Control/helpers')


// database
    const connection = require('./Control/configs/database')
    const User = require('./Model/User')

// config

    app.use(session({
        // Texto aleatorio para decriptar as sessoes
        secret: "UmTextoBemAleatorioParaAumentarSeguranca",
        // referenciar a sessao do servidor
        cookie:{
            // tempo de expiracao (milisegundos)
            maxAge: 3000000000000

        },
        resave: true,
        saveUninitialized: false
    }))
    
    // configurar o passport
    app.use(passport.initialize())

    // configurar a sessao
    app.use(passport.session())

    app.use(flash())

    // CONFIG do Middleware
        /*
        o middleware pega 3 parametros (request, response, next)
        vamos criar variaveis globais dentro dessa funcao para poder acessar por qualquer parte da applicação
        Nesse caso vamos criar uma para aparecer uma mensagem de sucesso quando o usuario cadastrar uma postagem

            res.local.<nome da variavel> é a funcao para criar variaveis globais
            next()
        */
        app.use( (req, res, next) => {
            res.locals.error_msg = req.flash('error_msg')
            res.locals.success_msg = req.flash('success_msg')
            res.locals.user = req.user || null
            //sempre no final do codigo do middleware vamos colocar o comando next() se nao vai travar a applicacao
            next()
        })

    app.set('view engine', 'ejs')
    
    app.use(express.static('public'))

    app.use(BodyParser.urlencoded({extended: true}))
    app.use(BodyParser.json())

    connection.authenticate().then( () => {
        console.log('conexao com o DB realizada')
    }).catch( (err) => {
        console.log('erro' + err)
    })




// rotas
app.get('/', checkAuthenticated, (req, res) => {
    //  podemos passa o email do usuario ou pelo req.user.email ou pega-la na view atraves do user.email pois criamos essa variaveel global
    res.render('index', {email: req.user.email})
})


app.get('/register', (req, res) => {
    res.render('register')
})


app.get('/login', checkisNotAuthenticated,(req, res) => {
    res.render('login')
})

app.get('/verify/:email', (req, res) => {
    var email = req.params.email
    res.render('verify', {email})
})


app.post('/register', (req, res) => {

    var {email, password, passwordConfirm} = req.body

    if(password !== passwordConfirm) {
        req.flash('error_msg', 'Senhas divergentes')
        res.redirect('/register')
    } 
    if (password.length <= 2 ) {
        req.flash('error_msg', 'senha muito pequena')
        res.redirect('/register')
    }

    User.findOne({
        where: {email: email}
    }).then( (user) => {

        if(user == undefined) {

            var salt = bcrypt.genSaltSync(10)
            var hash = bcrypt.hashSync(password, salt)

            const secretToken = randomstring.generate()

            User.create({
                email:email,
                password: hash,
                secretToken: secretToken
            }).then( () => {
                
                const mandou = require('./Control/configs/mailer')(email, secretToken)

                res.redirect('/verify/' + email)

            }).catch( (err) => {
                console.log('err')
                res.redirect('/')
            })

        } else {
            req.flash('error_msg', 'Esta conta já existe')
            res.redirect('/register')
        }

    }).catch(err=> {
        console.log(err)
    })

})


app.post('/verify', (req, res) => {

    var {email, token} = req.body

    User.findOne({where: {email: email}}).then( (user) => {

        if(user!= undefined) {

            if (user.secretToken === token) {

                User.update(
                    {confirmed: true,
                     secretToken: "",
                    },
                    {where: {email: user.email}}
                ).then( () => {
                    req.flash('success_msg', 'Email verificado com sucesso, Agora voce pode logar!')
                    res.redirect('/login')
                }).catch( err => {
                    req.flash('error_msg', 'erro interno ' + err)
                })
                
            } else {
                req.flash('error_msg', 'Token inválido.')
                res.redirect('/verify/' + user.email)
            }

        } else {
            req.flash('error_msg', 'esta conta nao existe')
            res.redirect('/register')
        }

    })
    
})


app.post('/login', (req, res, next) => {

    // config de autenticacao do passport
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next)

})


app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})



app.listen(8081, () => {
    console.log('servidor rodando na porta 8081')
})