const express = require('express');
const router = express.Router();
const ProductModel = require('../../models/product');
const CategoryModel = require('../../models/category');
const messages = require('./../../databases/messages/en.json');
const expressFileupload = require('express-fileupload');
const UserModel = require('../../models/user');
const CommentModel = require('../../models/comment');
const authGuard = require('./../../helpers/authGuard');



// ---------------- Redirect to home layout ---------------- 
router.all("/*" ,function(req,res,next){
  res.app.locals.layout = "layout";
  next();
});



// ---------------- Allow create new product for approve login users only ---------------- 

router.get('/create', authGuard.isLogin, async function (req, res) {
  if (!req.user.approveUser) {
    return res.redirect('/');
  };

  const cities = await CityModel.find().sort('name').exec();
  const categories = await CategoryModel.find().sort('name').exec();
  res.render('home/create', {
    categories,
    cities
  });

});



router.post('/create', authGuard.isLogin, expressFileupload(), async function (req, res, next) {
//check if you approved user or not
  if (!req.user.approveUser) {
    return res.redirect('/');
  };

  req.checkBody('price', messages.price_required).notEmpty();
  req.checkBody('price', messages.price_invlid).isNumeric();

  req.checkBody('body', messages.body_required).notEmpty();

  req.checkBody('phone', messages.phone_required).notEmpty();
  req.checkBody('phone', messages.phone_invlid).isMobilePhone('any');

  req.checkBody('city', messages.city_required).notEmpty();

 

  req.checkBody('category', messages.category_required).notEmpty();

  req.checkBody('title', messages.title_required).notEmpty();
  req.checkBody('title', messages.title_invlid).matches(/^[\u0600-\u06FF\w-\s]+$/);

  const errors = await req.validationErrors();
  if (errors) {

    const cities = await CityModel.find().sort('name').exec();
    const categories = await CategoryModel.find().sort('name').exec();
    res.render('home/create', {
      errors,
      categories,
      cities
    });

  } else {

    let images = [];

    if (Array.isArray(req.files.images)) {

      for (let i = 0; i < req.files.images.length; ++i) {
        const file = req.files.images[i];
        let __filename = Date.now() + '-' + file.name;
        file.mv('./public/uploads/' + __filename, (err) => {
          if (err) throw err;
        });
        images.push(__filename);
      };

    } else if (typeof req.files.images !== 'undefined') {

      const file = req.files.images
      let __filename = Date.now() + '-' + file.name;
      file.mv('./public/uploads/' + __filename, (err) => {
        if (err) throw err;
      });

      images.push(__filename);

    } else {
      images.push('no-image.jpg');
    };

    var product = new ProductModel();
    product.title = req.body.title;
    product.user = req.user._id;
    product.body = req.body.body;
    product.category = req.body.category;
    product.phone = req.body.phone;
    product.price = req.body.price;
    product.city = req.body.city;
    product.images = images;
    product.comments = [];
    product.save(function (err, product) {
      if (err) {
        console.log(err);
      }
      req.flash('success_message', 'تم اضافه المنتج بنجاح');
      res.redirect('/');
    });

  };


});



// ---------------- Find  all products and paginate pages---------------- 


router.get('/products', (req, res) => {

  const perPage = 3;
  const page = req.query.page || 1;

  ProductModel.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .populate('city')
    .then(products => {
      ProductModel.count().then(productCount => {
        CityModel.find({}).then(cities => {
          CategoryModel.find({}).then(categories => {
            res.render('home/products', {
              products: products,
              cities: cities,
              categories: categories,
              current: parseInt(page),
              pages: Math.ceil(productCount / perPage)
            });
          });
        });
      });
    });
});

// ---------------- Find products by category id ---------------- 

router.get('/category/:id', async function (req, res, next) {

  try {
    const limit = 30;
    const page = 1;
    const category = await CategoryModel.findOne({
      _id: req.params.id
    })

    .exec();
    const products = await ProductModel.find({
      category: req.params.id
    })
    .populate('category')
    .limit(limit)
    .skip( (page - 1) * limit)
    .sort('-createdAt')
    .exec();
    res.render('home/single-category', { products: products, category: category });

  } catch (err) {
    next(err);
  };

});

// ---------------- Find products by city id ---------------- 

router.get('/city/:id', async function (req, res, next) {

  try {
    const limit = 30;
    const page = 1;
    const city = await CityModel.findOne({
      _id: req.params.id
    })

    .exec();
    const products = await ProductModel.find({
      city: req.params.id
    })
    .populate('city')
    .limit(limit)
    .skip( (page - 1) * limit)
    .sort('-createdAt')
    .exec();
    res.render('home/city', { products: products, city: city });

  } catch (err) {
    next(err);
  };

});


// ---------------- Find all products related to user ---------------- 

router.get('/my-products', async function (req, res, next) {
  
  try {

    const categories = await CategoryModel.find().exec();
    const cities = await CityModel.find().exec();
    const products = await ProductModel.find()
    .populate({ 
      path: 'user', 
      populate: { 
        path: 'category' 
      } 
    })
    .exec();

    res.render('home/my-products', { 
      products, 
      categories, 
      cities 
    });

  } catch ( err ) {
    next(err);
  };


});


// ---------------- Find products by category id ---------------- 

router.get('/single/:id', async function (req, res, next) {

  try {

    const limit = 30;
    const page = 1;

    const comments = await CommentModel.find({
      product: req.params.id
    })
    .limit(limit)
    .skip( (page - 1) * limit)
    .populate('user')
    .sort('-createdAt')
    .exec();

    const cities = await CityModel.find().exec();
    const categories = await CategoryModel.find().exec();
    const product = await ProductModel.findOne({
      _id: req.params.id
    })
    .populate('user')
    .populate('city')
    .exec();

    res.render('home/single', {
      product,
      categories,
      cities,
      comments
    });

  } catch ( err ) {
    next(err);
  };


});


// ---------------- Edit product---------------- 

router.get('/edit/:id', function (req, res, next) {
  CityModel.findOne({}, function (err, city) {
    CategoryModel.find({}, function (err, categories) {
      ProductModel.findOne({ _id: req.params.id }).populate({ path: 'user', populate: { path: 'category' } }).exec(function (err, product) {
        if (err) {
          console.log(err);
        }
        res.render('home/edit-product', { product: product, categories: categories, city: city });
      });
    });
  });
});


router.post('/edit/:id', async function (req, res, next) {

  req.checkBody('price', messages.price_required).notEmpty();
  req.checkBody('price', messages.price_invlid).isNumeric();

  req.checkBody('body', messages.body_required).notEmpty();

  req.checkBody('phone', messages.phone_required).notEmpty();
  req.checkBody('phone', messages.phone_invlid).isMobilePhone('any');

  req.checkBody('title', messages.title_required).notEmpty();
  req.checkBody('title', messages.title_invlid).matches(/^[\u0600-\u06FF\w-\s]+$/);

  const errors = await req.validationErrors();
  if (errors) {

    req.flash('error_message', errors[0]);
    res.redirect('/edit/' + req.params.id);

  } else {

    // update
    ProductModel.updateOne({ _id: req.params.id }, {
      title: req.body.title,
      body: req.body.body,
      price: req.body.price,
      phone: req.body.phone,
    })
      .exec()
      .then(() => {
        req.flash('success_message', 'تم تعديل  المنتج بنجاح ');
        res.redirect('/product/my-products');
      })
      .catch(err => {
        console.log(err);
      });

  };

});

// ---------------- Delete product with it's comment ---------------- 

router.delete('/delete/:id', function (req, res) {
  ProductModel.findOne({ _id: req.params.id })
    .exec(function (err, product) {
      ProductModel.remove({ _id: req.params.id }).exec(function (productRemoved) {
        req.flash('success_message', 'تم حذف المنتج بنجاح ');
        res.redirect('/product/my-products');
      });

    });
});





module.exports = router;

