const mongoose = require('mongoose');
const path = require('path');
const Schema = mongoose.Schema;

const citySchema = new Schema({
    name:{
        type: String,
        require: true
    },
});

module.exports = CityModel = mongoose.model('City', citySchema);

const data = require(
    path.resolve(`./databases/default-app-data/cities-of-saudi-arabia.json`)
);
const addDefaultData = async () => {
    if(await CityModel.countDocuments() === 0) {
        CityModel.insertMany(
            data.map( v => {
                return {
                    _id : v._id,
                    name : v.nameAr
                }
            })
        )
        .then( res => {
        })
        .catch( err => {
        })
    }
};
addDefaultData()

