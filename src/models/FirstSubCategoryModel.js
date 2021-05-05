const mongoose = require('mongoose');

const { Schema } = mongoose;

const FirstSubCategorySchema = new Schema({
  category_name: {
    type: String,
    required: true,
  },

  parent_category: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  category_description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('FirstSubCategory', FirstSubCategorySchema);
