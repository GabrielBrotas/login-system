require('dotenv').config()

const Sequelize = require('sequelize')

const connection = new Sequelize('loginsystem', process.env.DBUSER, process.env.DBPASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    timezone: "-03:00"
})

module.exports = connection