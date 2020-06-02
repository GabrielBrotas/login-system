// enviar email

// 1 -para permitir a variavel env
require('dotenv').config()
// 2 - criar arquivo .gitignore e .env para armazenar os arquivos que nao vao subir para o github

const nodemailer = require('nodemailer') 

// Step 1
/*
    Link para ativar a forma de deixar o email seguro, vai permitir que o nodemailer tenha aceesso a conta para mandar emails
    https://myaccount.google.com/lesssecureapps
*/

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});


function enviarEmail(email, token) {
    
    // Step 2
    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'teste nodemailer',
        text: 'testando conteudo',
        html: "<h1>Obrigado por se cadastrar no meu sistema</h1>" +
            "<h2>Seu token: </h2><br>" + token 
    };
    
    // Step 3
    transporter.sendMail(mailOptions, (err, data) => {
        if(err) {
            console.log('erro ao enviar email' + err)
            return false
        } else {
            console.log('email enviado!!')
            return true
        }
    })
    
}

module.exports = enviarEmail