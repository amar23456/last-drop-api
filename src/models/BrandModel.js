const mongoose = require('mongoose');

const { Schema } = mongoose;

const BrandSchema = new Schema({
  brand_name: {
    type: String,
    required: true,
  },

  brand_description: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Brand', BrandSchema);
