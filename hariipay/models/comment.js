const mongoose = require('mongoose');
const mongooseSchemaOptions = require('./mongooseSchemaOptions');
const Schema  = mongoose.Schema;

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    body:{
        type: String,
        required: true
    },

}, mongooseSchemaOptions );

module.exports = CommentModel = mongoose.model('Comment', commentSchema);

