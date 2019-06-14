const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseSchemaOptions = require('./mongooseSchemaOptions');
const mainHelper = require('./../helpers/mainHelper');

const userSchema = new Schema({
  firstName: { 
    type: String,
    required: true 
  },
  lastName:{
    type: String,
    required: true 
  },
  email:{ 
    type: String,
    required: true ,
    unique : true,
    index : true
  },
  password:{ 
    type: String,
    required: true 
  },
  approveUser:{
    type:Boolean,
    default:false
  },
  isAdmin:{
    type:Boolean,
    default:false
  },
  image: String,
} , mongooseSchemaOptions);

module.exports = UserModel = mongoose.model('User', userSchema);

//Admin username and password
const addDefaultData = async () => {
  if(await UserModel.countDocuments() === 0) {
    UserModel.create(      
        {
          firstName : 'admin',
          lastName : 'admin',
          email : 'hariii2018hariii@gmail.com',
          password : mainHelper.hashSync('admin2018demo'),
          approveUser : true,
          isAdmin : true,
        }
    )
    .then( admin => {
    })
    .catch( err => {
    });
  }
};
addDefaultData()
