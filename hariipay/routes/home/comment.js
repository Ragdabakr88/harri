var express = require('express');
var router = express.Router();
var Product = require('../../models/product');
var Comment = require('../../models/comment');
var User = require('../../models/user');
var async = require('async');
/* GET home page. */


// ---------------- Direct to home layout ------------------------- 

router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "layout";
	next();
});

product = {
  name : 'phone',
  price : 200,
  comments : ['asdasd','sadasdassad' , 'sdasdasdas']
}
// ---------------- Create comment---------------- 

router.post("/", function(req, res, next) {
  Comment.create({
    user : req.user._id,
    product : req.body.productId,
    body : req.body.body ,
  })
  .then( (comment) => {
    req.flash("success_message","تم اضافه تعليقك  ");
    res.redirect('/product/single/'+ req.body.productId);
  })
  .catch( err => {
    next(err);
  });

});

// ---------------- Delete comment--------------- 

router.delete('/delete/:id', function(req, res, next)  {
  
  Comment.remove({
    _id: req.params.id 
  })
  .exec()
  .then( () => {
    res.redirect("/admin/comment");
  })
  .catch( err => {
    next(err);
  });

});


module.exports = router;


