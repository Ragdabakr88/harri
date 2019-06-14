const mongoose = require('mongoose');
const mongooseSchemaOptions = require('./mongooseSchemaOptions');
const Schema = mongoose.Schema;

const productSchema = new Schema({

   user: {
       type: Schema.Types.ObjectId,
       ref:'User'
    },
   category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
   city:{
        type: Schema.Types.ObjectId,
        ref: 'City'
    },
    phone:{
          type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    body:{
        type: String,
        require: true
    },
    images:[String]
} , mongooseSchemaOptions);

productSchema.index({
    'title'  : 'text', 
    'body' : 'text',
    'phone' : 'text',
});

module.exports = ProductModel = mongoose.model('Product', productSchema);


