// Dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const Location = require('../models/LocationModel');
const Subscription =require('../models/SubscriptionModel')
// Models import

exports.postSignup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  // Encodeaza parola
  try {
    const user = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role: 'Owner',
      complete: false,
      active: true,
      confirmed: false,
    });
    await user.save();
     try {
       const subs=new Subscription({
         name:`${firstName} +${lastName}`,
         description:'new user',
         price:'max',
         sub_type:'30 days',
         availability:30,
         locations:3,
         zones:4,
         user_accounts:1
       })
       subs
       .save()
       
     }catch{
       res.send(err)
     }

    const token = jwt.sign({ userId: user._id }, 'My_Secret_key');
    // trimm password
    user.password = undefined;
    res.send({ token, user });
  } catch (err) {
    return res.status(422).send({ Error: 'Adresa de email este deja inregistrata' });
  }
};

exports.postSignin = async (req, res) => {
  const { email, password, pushNotificationsToken } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }

  let user = {};
  let locations = [];

  try {
    user = await User.findOne({ email });
  } catch (e) {
    console.log(e);
  }

  try {
    locations = await Location.find({ user_id: user._id });
  } catch (e) {
    console.log(e);
  }

  if (!user) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, 'My_Secret_key');
    const usr = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      company: user.company,
      complete: user.complete,
      locations,
    };

    user.pushToken = pushNotificationsToken;
    user.save((result) => {
      res.send({ token, usr });
    });
  } catch (err) {
    console.log('ISSUE SIGNING IN ', err);
    return res.status(422).send({ error: 'Invalid password or email' });
  }
};
