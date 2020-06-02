

module.exports = {

    checkAuthenticated(req, res, next) {
        // se o usuario estiver autenticado por passar para a rota clicadas
        if(req.isAuthenticated()) {
            return next()
        } 
        res.redirect('/login')
    },

    checkisNotAuthenticated(req, res, next) {
        // se o usuario nao esetiver autenticado vai poder passar para a rota, ex: login, register
        if(!req.isAuthenticated()) {
            return next()
        } 
        res.redirect('/')
    },

    checkConfirmEmail(user) {

        var isChecked = user.confirmed

        if (isChecked === false) {
            return false;
        } else {
            return true;
        }

    }

}