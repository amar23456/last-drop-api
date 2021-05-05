const mongoose = require('mongoose');

const { Schema } = mongoose;

const inventoryModel = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inventory_status: {
    type: String,
    required: true,
    default: 'Submitted',
  },
  zone_id: {
    type: Schema.Types.ObjectId,
    ref: 'Zone',
  },
  products: [
    {
      product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      volume: {
        type: Number,
        required: true,
      },
      bottleCount: {
        type: Number,
        required: true,
      },
    },
  ],
  subDate: Date,
  approvedByUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  finished: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Inventory', inventoryModel);
