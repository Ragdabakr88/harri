
const express = require('express');
const router = express.Router();
const UserModel = require('../../models/user');

// ---------------- Approving user in admin ---------------- 

router.post('/approve-user' , function (req, res){
   UserModel.findByIdAndUpdate(req.body.user_id , {
    approveUser : req.body.approveUser === 'true' ? true : false
   } , {
       new : true
   })
   .exec()
   .then( user => res.json({user}))
   .catch( error => res.json({error}))
});

// ---------------- All users---------------- 
router.get('/',function (req, res){
    UserModel.find({},function (err, users){
        if(err) return err;
       res.render("admin/users/index",{users:users});
    });
});

module.exports = router;





