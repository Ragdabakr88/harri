const UserModel = require('./../models/user');

class AuthGuard {
    constructor() {};
    isAdmin(req, res, next){
        if(req.isAuthenticated()){
            if(req.user.isAdmin){
                return next();
            } else {
                res.redirect('/');
            }
        } else  {
            res.redirect('/login');
        };
    };
    isLogin(req, res, next){
        if(req.isAuthenticated()){
            return next();
        } else  {
            res.redirect('/login');
        };
    };
    isNotLogin(req, res, next){
        if(req.isAuthenticated()){
            res.redirect('/profile');
        } else  {
            return next();
        };
    };
    isCanAddProduct(user_id){
    };
};

module.exports = authGuard = new AuthGuard();