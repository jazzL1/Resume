module.exports = function isLoggedIn(req,res,next) {
    if(!req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}