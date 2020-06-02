// modules
const express = require('express')
const app = express()
const BodyParser = require('body-parser')
const bcrypt = require('bcryptjs')

// sessao e autenticacao
    const passport = require('passport') // pacote de autenticacao
    const session = require('express-session') // Carregar o modulo de sessions para guardar o usuario que esta logado
    require('./Control/passport-config')(passport) // passar o passport para o arquivo passport-config
    const flash = require('express-flash') // mostrar mensagem de erro flash

// esta autenticado? 
    const {checkAuthenticated, checkisNotAuthenticated} = require('./Control/isAuth')
// database
    const connection = require('./Control/database')
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

    // CONFIG do Middleware
        /*
        o middleware pega 3 parametros (request, response, next)
        vamos criar variaveis globais dentro dessa funcao para poder acessar por qualquer parte da applicação
        Nesse caso vamos criar uma para aparecer uma mensagem de sucesso quando o usuario cadastrar uma postagem

            res.local.<nome da variavel> é a funcao para criar variaveis globais
            next()
        */
        app.use( (req, res, next) => {
            // Variavel para pessoas logadas(permissao), vai armazenar os dados da pessoa logada e, caso nao tenha nenhum usuario logado vai pegar null
            res.locals.user = req.user || null
            //sempre no final do codigo do middleware vamos colocar o comando next() se nao vai travar a applicacao
            next()
        })

    

    app.use(flash())

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


app.post('/register', (req, res) => {

    var {email, password, passwordConfirm} = req.body

    console.log(email)
    
    User.findOne({
        where: {email: email}
    }).then( (user) => {

        if(user == undefined) {

            var salt = bcrypt.genSaltSync(10)
            var hash = bcrypt.hashSync(password, salt)

            User.create({
                email:email,
                password: hash
            }).then( () => {
                res.redirect('/')
            }).catch( (err) => {
                console.log('err')
                res.redirect('/')
            })

        } else {
            console.log('email ja cadastrado no sisteme')
            res.redirect('/register')
        }

    }).catch(err=> {
        console.log(err)
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