const User = require('../models/UserModel');
const Zone = require('../models/ZonesModel');
const Product = require('../models/ProductModel');
const Inventory = require('../models/InventoryModel');
const Subscription = require('../models/SubscriptionModel');

const helpers = require('../lib/helpers');

exports.getAccountData = (req, res) => {
  const usr = {
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    email: req.user.email,
  };
  if (req.user.role === 'Owner' || req.user.role === 'Admin') {
    Subscription.findById(req.user.subscription)
      .then((subscription) => {
        const { company } = req.user;
        res.send({ subscription, company, usr });
      })
      .catch((err) => console.log(err));
  } else {
    User.findById(req.user.main_account_id)
      .then((user) => {
        Subscription.findById(user.subscription).then((subscription) => {
          res.send(subscription, usr);
        });
      })
      .catch((err) => console.log(err));
  }
};
