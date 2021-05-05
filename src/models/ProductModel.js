const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

const ProductSchema = new Schema({
  product_name: {
    type: String,
    required: true,
  },
  product_description: {
    type: String,
    required: false,
  },
  product_brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  product_volume: {
    type: String,
    required: true,
  },
  product_age: {
    type: String,
    required: false,
  },
  product_abv: {
    type: String,
    required: false,
  },

  // TODO: Change this to a category id
  product_category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  product_subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'FirstSubCategory',
    required: true,
  },
  product_second_subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'SecondSubCategory',
    required: true,
  },
  product_image: {
    type: String,
    required: false,
  },
  product_active: {
    type: Boolean,
    default: false,
  },
  product_bottled: {
    type: String,
    required: false,
  },
  product_neck_line: {
    type: String,
    required: false,
  },
  // product_formula_1: {
  //   type: String,
  //   required: false,
  // },
  // product_formula_2: {
  //   type: String,
  // },
  // product_formula_3: {
  //   type: String,
  // },

  // totalH: {
  //   type: Number,
  // },
  // bodyH: {
  //   type: Number,
  // },
  // bodyW: {
  //   type: Number,
  // },
  // reductionH: {
  //   type: Number,
  // },
  // neckH: {
  //   type: Number,
  // },
  // neckW: {
  //   type: Number,
  // },
});

ProductSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', ProductSchema);
