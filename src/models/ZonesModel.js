const mongoose = require('mongoose');

const { Schema } = mongoose;

const zoneSchema = new Schema({
  zone_name: {
    type: String,
    required: true,
  },
  account_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  location_id: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  users: [
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
    },
  ],
  products: [
    {
      product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model('Zone', zoneSchema);
