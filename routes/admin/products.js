var express = require('express');
var router = express.Router();
var Product = require('../../models/product');
var Category = require('../../models/category');
var Comment = require('../../models/comment');
var City = require('../../models/city');
const messages = require('./../../databases/messages/en.json');
const expressFileupload = require('express-fileupload');
const UserModel = require('../../models/user');
const authGuard = require('./../../helpers/authGuard');
var fs = require('fs');


/* GET home page. */

// ---------------- Direct to admin page--------------- 

router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "admin";
	next();
});

// ---------------- ACreate new product ---------------- 

router.get('/create', async function(req, res) {
  if(! req.user.approveUser) {
    return res.redirect('/');
  };

  const cities = await City.find().sort('name').exec();
  const categories = await Category.find().sort('name').exec();
  res.render('admin/products/create' , {
    categories,
    cities
  });
 
});
router.post('/create' , expressFileupload() , async function(req, res, next) {

 req.checkBody('price' , messages.price_required ).notEmpty();
  req.checkBody('price' , messages.price_invlid ).isNumeric();

  req.checkBody('body' , messages.body_required ).notEmpty();
  
  req.checkBody('phone' , messages.phone_required ).notEmpty();
  req.checkBody('phone' , messages.phone_invlid ).isMobilePhone('any');

  req.checkBody('city' , messages.city_required ).notEmpty();

  req.checkBody('category' , messages.category_required ).notEmpty();

  req.checkBody('title' , messages.title_required ).notEmpty();
  req.checkBody('title' ,   messages.title_invlid ).matches(/^[\u0600-\u06FF\w-\s]+$/);
 const errors = await req.validationErrors(); 
  if (errors) {

    const cities = await City.find().sort('name').exec();
    const categories = await Category.find().sort('name').exec();
    res.render('admin/products/create' , {
      errors,
      categories,
      cities
    });

  } else {

    let images = [];

    if(Array.isArray(req.files.images)) {
      
      for(let i = 0 ; i < req.files.images.length; ++i) {
        const file = req.files.images[i];
        let __filename = Date.now() + '-' + file.name;
        file.mv('./public/uploads/' + __filename, (err)=>{
           if(err) throw err;
        });
        images.push(__filename);
      };

    } else if(typeof req.files.images !== 'undefined' ) {

        const file = req.files.images
        let __filename = Date.now() + '-' + file.name;
        file.mv('./public/uploads/' + __filename, (err)=>{
          if(err) throw err;
        });

        images.push(__filename);

    } else {
      images.push( 'no-image.jpg');
    };

    var product = new Product();
    product.title = req.body.title;
    product.user = req.user._id;
    product.body = req.body.body;
    product.category = req.body.category;
    product.phone = req.body.phone;
    product.price = req.body.price;
    product.city = req.body.city;
    product.images = images;
    product.comments = [];
    product.save(function (err,product){
      if (err) {
        console.log(err);
      }
      req.flash('success_message','تم اضافه المنتج بنجاح')  ;
      res.redirect('/admin/products');
    });  

  };


});   
  

// ---------------- Find all products ---------------- 
router.get('/', function(req, res, next) {
Product.find({}).populate("user").populate("category").exec(function(err,products){
      if (err){
      	console.log(err);
      }
        res.render('admin/products',{products:products});
   });
});


// ---------------- Edit product ---------------- 
router.get('/edit/:id', function(req, res, next) {
	Product.findOne({_id:req.params.id},function(err,product){
		if(err){
			console.log(err);
            }
		   res.render('admin/products/edit',{product:product});		
	  });
   });

router.post('/edit/:id', async function(req, res, next) {

  req.checkBody('price' , messages.price_required ).notEmpty();
  req.checkBody('price' , messages.price_invlid ).isNumeric();

  req.checkBody('body' , messages.body_required ).notEmpty();
  
  req.checkBody('phone' , messages.phone_required ).notEmpty();
  req.checkBody('phone' , messages.phone_invlid ).isMobilePhone('any');

  req.checkBody('title' , messages.title_required ).notEmpty();
  req.checkBody('title' , messages.title_invlid  ).matches(/^[\u0600-\u06FF\w-\s]+$/);

 const errors = await req.validationErrors(); 
  if (errors) {

      req.flash('error_message', errors[0]) ; 
      res.redirect('/admin/products/edit/' + req.params.id);

  } else {

    // update
    Product.updateOne({_id:req.params.id} , {
      title : req.body.title,
      body : req.body.body,
      price : req.body.price,
      phone : req.body.phone,
    })
    .exec()
    .then(() => {
      req.flash('success_message','تم تعديل  المنتج بنجاح ') ; 
      res.redirect('/admin/products');
    })
    .catch( err => {
      console.log(err);
    });

  };

});

// ---------------- Delete Product and it's images ---------------- 
router.delete('/delete/:id',async function (req, res){

  try {

    const product = await Product.findOneAndRemove({
      _id: req.params.id
    })
    .exec();
    
    if(product) {
      product.images.forEach( src => {
        fs.unlink(`./public/uploads/${src}` , () => {});
      });
    };

    const result = await Comment.deleteMany({
      product: req.params.id
    })
    .exec();


    req.flash('success_message', 'تم حذف المنتج ');
    res.redirect('/admin/products');

  } catch ( err ) {
    next(err);
  };

});


module.exports = router;