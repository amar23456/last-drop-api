const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
  },
  company: {
    name: {
      type: String,
      required: false,
    },
    cif: {
      type: String,
      required: false,
    },
    nr_reg_com: {
      type: String,
    },
    address: {
      type: String,
      required: false,
    },
    bank: {
      type: String,
      required: false,
    },
    iban: {
      type: String,
      required: false,
    },
  },
  // Doar pentru conturi sub Owner
  main_account_id: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  confirmed: {
    type: Boolean,
    required: false,
  },
  active: {
    type: Boolean,
    required: true,
  },
  complete: {
    type: Boolean,
    required: true,
  },
  tos: {
    type: Boolean,
    require: false,
  },
  gdpr: {
    type: Boolean,
    required: false,
  },
  pushToken: {
    type: String,
    required: false,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: false,
  },
  subExpiration: Date,
  step: {
    type: Number,
  },
});
// Encrypt the password
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(12, (err, hash) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, hash, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});
// Compare password with user encrypted password
userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      if (!isMatch) {
        return reject(false);
      }
      resolve(true);
    });
  });
};

// userSchema.methods.addLocations = function(location){
//
// };

module.exports = mongoose.model('User', userSchema);
