const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userProductsSchema = new Schema ({
    client_id:{
        type:String,
        required:true
    },
    products:[{
        product_id:{
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required:true
        }
    }]

})

module.exports = mongoose.model('Zone', zoneSchema)