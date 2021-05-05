const mongoose = require('mongoose');

const { Schema } = mongoose;

const locationSchema = new Schema({
  location_name: {
    type: String,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Location', locationSchema);
