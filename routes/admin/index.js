const express = require('express');
const router = express.Router();
const Product = require('../../models/product');
const Category = require('../../models/category');
const Comment = require('../../models/comment');
const User = require('../../models/user');
const authGuard = require('../../helpers/authGuard');



// ---------------- Direct to admin page--------------- 

router.all("/*"  ,authGuard.isAdmin, function(req,res,next){
	res.app.locals.layout = "admin";
	next();
});

// ---------------- Chart--------------- 

router.get('/' , async function(req, res, next) {
	
	try {
		const productCount = await Product.count({}).exec();
		const commentCount = await Comment.count({}).exec();
		const categoryCount = await Category.count({}).exec();
		const userCount = await User.count({}).exec();
		res.render('admin/index',{
			productCount,
			commentCount,
			categoryCount,
			userCount
		});
	} catch (err) {
		next(err);
	};
	
});	
// ---------------- Direct to dashboard--------------- 

router.get('/dashboard',function(req, res, next) {
  res.render('admin/dashboard');
});

module.exports = router;