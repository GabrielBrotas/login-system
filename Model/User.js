const Sequelize = require('sequelize')
const connection = require('../Control/configs/database')

const User = connection.define('users', {

    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    confirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    secretToken: {
        type: Sequelize.STRING,
        allowNull: false
    }

})

// table criada, nao precisa mais desse comando
User.sync( {force: false} )

module.exports = User