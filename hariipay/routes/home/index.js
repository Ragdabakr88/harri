const express = require('express');
const router = express.Router();
const ProductModel = require('../../models/product');
const CommentModel = require('../../models/comment');
const CategoryModel = require('../../models/category');
const CityModel = require('../../models/city');
const UserModel = require('../../models/user');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const authGuard = require("../../helpers/authGuard");
const mainHelper = require('./../../helpers/mainHelper');
const messages = require('./../../databases/messages/en.json');



// ---------------- Redirect to home layout ---------------- 
router.all("/*" ,function(req,res,next){
	res.app.locals.layout = "layout";
	next();
});

// ---------------- Register---------------- 
router.get('/register', authGuard.isNotLogin, function (req, res) {
    res.render('home/register');
});
router.post('/register', authGuard.isNotLogin, async function (req, res) {

    req.checkBody('firstName', messages.firstName_required).notEmpty()
    req.checkBody('lastName', messages.lastName_required).notEmpty()
    req.checkBody('email', messages.email_required).notEmpty()
    req.checkBody('email', messages.email_invlid).isEmail()
    req.checkBody('password', messages.password_required).notEmpty()
    req.checkBody('password', messages.password_not_match).equals(req.body.passwordConfirm);

    const errors = await req.validationErrors();
    if (errors) {

        return res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        });

    } else {

        UserModel.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            image: 'no-image.jpg',
            password: mainHelper.hashSync(req.body.password),
        })
            .then(user => {
                req.logIn(user, err => {
                    if (err) {
                        req.flash("error_message", messages.server_error);
                    } else {
                        req.session.cookie.expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 2));
                        req.flash("success_message", messages.register_success);
                        res.redirect('/')
                    };
                });
            })
            .catch((err) => {
                if(mainHelper.isUniqueError(err)) {
                    res.render('home/register', {
                        errors: [ messages.email_used_before ],
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                    });
                } else {
                    req.flash("error_message", messages.server_error);
                    res.redirect('/register')
                }
            });

    };

});

// ---------------- Login---------------- 

router.get('/login', authGuard.isNotLogin, function (req, res) {
    res.render('home/login');
});
router.post('/login', authGuard.isNotLogin, async function (req, res) {

    req.checkBody('password', messages.password_invlid).notEmpty()
    req.checkBody('email', messages.email_required).notEmpty()

    const errors = await req.validationErrors();
    if (errors) {

        return res.render('home/login', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        });

    } else {

        UserModel.findOne({
            email : req.body.email
        })
        .then(user => {
            if(user) {
                if(mainHelper.compareSync(req.body.password , user.password)) {
                    req.logIn(user, err => {
                        if (err) {
                            req.flash("error_message", messages.server_error);
                        } else {
                            if(req.body.rememberMe) {
                                req.session.cookie.expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 2));
                            } else {
                                req.session.cookie.expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 6));
                            };
                            req.flash("success_message", messages.register_success);
                            res.redirect('/')
                        };
                    });
                } else {
                    res.render('home/login', {
                        errors: [messages.password_not_match],
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                    });
                }
            } else {
                res.render('home/login', {
                    errors: [messages.user_not_found],
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                });
            };
        })
        .catch( err => next(err))

    };

});

// ---------------- Logout ---------------- 
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// ---------------- Find all products---------------- 
router.get('/', async function (req, res) {
    const perPage = 4;
    const page = req.query.page;

    if(isNaN(page) || page == '0') {
        return res.redirect('/?page=1');
    };

    const cities = await CityModel.find().sort('name').exec();
    const categories = await CategoryModel.find().sort('name').exec();
    const productCount = await ProductModel.countDocuments().exec();
    const products = await ProductModel.find()
    .populate('city category')
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .sort('-createdAt')
    .exec();

    if(page > 1 && products.length === 0) {
        return res.redirect('/?page=1');
    } else {
        res.render('home/index', {
            cities ,
            products ,
            categories,
            current: parseInt(page),
            pages: Math.ceil(productCount / perPage)
        });
    }

 

});


// ---------------- Redirect to home page ---------------- 

router.all("/*", function (req, res, next) {
    res.app.locals.layout = "layout";
    next();
});

// ---------------- search ---------------- 

router.get('/search', function (req, res, next) {
    const city  = req.query.city;
    const category  = req.query.category;
    const searchQuery  = req.query.searchQuery;

    const query = {
        city : city,
        category: category,
        $text : { 
            $search : searchQuery 
        },
    }

    ProductModel.find(query)
    .populate('city category user')
    .exec()
    .then( products => {
        console.log({products})
        res.render('home/search', { 
            products


        });
    })
    .catch( err => next(err))
});



router.post('/search', function (req, res, next) {
    const str = `searchQuery=${req.body.searchQuery}&&city=${req.body.city}&&category=${req.body.category}`;
    res.redirect('/search?' + str);
});




// ---------------- Contact ---------------- 
//Contact form

router.get('/contact', function(req, res, next) {
  res.render('home/contact');
});


 
 // Send a contact form via Nodemailer.
 
router.post('/contact', (req, res) => {
  const output = `
    <p>لديك رساله جديده </p>
    <h3>تفاصيل الرساله </h3>
    <ul>  
      <li><strong>الاسم : ${req.body.name}</strong></li>
      <li>الايميل : ${req.body.email}</li>
      <li>الجوال : ${req.body.phone}</li>
    </ul>
    <h3>الرساله </h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'hariii2018hariii@gmail.com', // generated ethereal user
        pass: 'admin2018demo'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"blog contact" <hariii2018hariii@gmail.com>', // sender address
      to: 'hariii2018hariii@gmail.com', // list of receivers
      subject: 'رساله من موقع الحري ', // Subject line
      text: 'رساله جديده ', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.render('home/contact', {msg:'تم ارسال الرساله بنجاح '});
  });
  });
// ---------------- Single page details ---------------- 
router.get('/single/:id', function (req, res, next) {
        ProductModel.findOne({ _id: req.params.id }).populate({ path: "comments", populate: { path: 'user' } }).exec(function (err, product) {
            CategoryModel.find({}, function (err, categories) {
                CityModel.find({}, function (err, cities) {
                if (err) { console.log(err); }
                res.render('home/single', { product: product, categories: categories,cities:cities});
            });
        });
    });
  });

// ---------------- Find products by category id ---------------- 
router.get('/category/:id', function (req, res, next) {
    CategoryModel.findOne({ product: req.params.id }, function (err, category) {
        ProductModel.find({ category: req.params.id }, function (err, products) {
            if (err) { console.log(err); }
            res.render('home/category', { products: products, category: category });
        });
    });
});

// ---------------- Find products by city id ---------------- 
router.get('/city/:id', function (req, res, next) {
    CityModel.findOne({ _id: req.params.id }, function (err, city) {
        ProductModel.find({ city: req.params.id }, function (err, ptoducts) {
            if (err) { console.log(err); }
            res.render('home/city', { products: products, city:city });
        });
    });
});






module.exports = router;
