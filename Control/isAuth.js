

module.exports = {

    checkAuthenticated(req, res, next) {
    
        if(req.isAuthenticated()) {
            return next()
        } 
        res.redirect('/login')
    },
    checkisNotAuthenticated(req, res, next) {
    
        if(!req.isAuthenticated()) {
            return next()
        } 
        res.redirect('/')
    }

}