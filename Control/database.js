const Sequelize = require('sequelize')

const connection = new Sequelize('loginsystem', 'root', 'Gabriel22*/', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: "-03:00"
})

module.exports = connection