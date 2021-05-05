const mongoose = require('mongoose');

const { Schema } = mongoose;

const subscriptionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  sub_type: {
    type: String,
    required: true,
  },
  availability: {
    type: Number,
    required: true,
  },
  locations: {
    type: Number,
    required: true,
  },
  zones: {
    type: Number,
    required: true,
  },
  user_accounts: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
