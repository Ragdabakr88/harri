var express = require('express');
var router = express.Router();
var Category = require('../../models/category');

/* GET home page. */

// ---------------- Direct to admin page--------------- 

router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "admin";
	next();
});

// ---------------- Create category--------------- 

router.get('/create', function(req, res, next) {
	Category.find({}).populate('products').exec(function(err,categories){
		if(err) throw err;
	   res.render('admin/category/create',{categories:categories});	
	});  
});



router.post('/create', function(req, res, next) {

 let errors = [];
  if(!req.body.name){
  	errors.push({message:"من فضلك ادخل اسم المنتج "});
  }
    
  if(errors.length > 0){
  	res.render('admin/category/create',{errors:errors})
  }else{


	var category = new Category();
	category.name= req.body.name;
	category.save(function (err,category){
		if (err){
			console.log(err);
		}
	req.flash('success_message','تم انشاء قسم جديد بنجاح ');
    res.redirect('/admin/category/create');
   }); 
  }

});
// ---------------- Edit category--------------- 

router.get('/edit/:id', function(req, res, next) {
	Category.findOne({_id:req.params.id},function(err,category){
		if(err) throw err;
	   res.render('admin/category/edit',{category:category});	
	});  
});

router.put('/edit/:id', function(req, res, next) {
Category.findOne({_id:req.params.id},function(err,category){
	category.name= req.body.name;
	category.save(function (err,category){
		if (err){console.log(err);}
	req.flash('success_message','تم تعديل اسم القسم ');
    res.redirect('/admin/category/create');
    });  
  });
});

// ---------------- Delete category--------------- 
router.delete('/delete/:id', function(req, res, next) {
Category.findOne({_id:req.params.id},function(err,category){
	category.remove(function (err,category){
		if (err){console.log(err);}
	req.flash('success_message','تم حذف القسم ');
    res.redirect('/admin/category/create');
    });  
  });
});


module.exports = router;