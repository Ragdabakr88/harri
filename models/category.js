const mongoose = require('mongoose');
const mongooseSchemaOptions = require('./mongooseSchemaOptions');
const Schema = mongoose.Schema;
const path = require('path');

const categorySchema = new Schema({
    name: { 
        type: String,
        required: true 
    },
} , mongooseSchemaOptions);

module.exports = CategoryModel = mongoose.model('Category', categorySchema);


const data = require(
    path.resolve(`./databases/default-app-data/category.json`)
);
const addDefaultData = async () => {
    if(await CategoryModel.countDocuments() === 0) {
        CategoryModel.insertMany(
            data
        )
        .then( res => {
        })
        .catch( err => {
        })
    }
};
addDefaultData()
