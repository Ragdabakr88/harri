const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../models/user');
const mainHelper = require('../helpers/mainHelper');

passport.serializeUser((user , done)=>{
    done(null , user.id);
});

passport.deserializeUser((id , done)=>{
    UserModel.findById(id ,(err , user)=>{
        done(err , user)
    });
});

passport.use('local-login' , new LocalStrategy(
    {
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    (req , email , password , done) => {
        UserModel.findOne({email : email})
        .then(user => {
            if(user) {
                if(mainHelper.compareSync(password , user.password)) {
                    done(null,user)
                } else {
                    done(null , false , req.flash('error_message' , 'رقم المرور غير متطابق'))
                };
            } else {
                done(null , false , req.flash('error_message' , 'لا يوجد مستخدم'))
            };
        })
        .catch(err=>{
            done(err);
        });
    }
))

