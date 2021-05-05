const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');
const Product = require('../models/ProductModel');
const Zone = require('../models/ZonesModel');
const Location = require('../models/LocationModel');
const Inventory = require('../models/InventoryModel');
const Brand = require('../models/BrandModel');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
const env = require('../env');
sgMail.setApiKey(env.MAIL_API_KEY);



exports.getDashboard = (req, res) => {
  const { authorisation } = req.headers;
  const { user } = req;
  if (user.role === 'Owner') {
    Zone.find({ account_id: user._id })
      .then((zones) => {
        Location.find({ user_id: user._id })
          .then((locations) => {
            User.find({ main_account_id: user._id }).then((users) => {
              const usr = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
              };
              Inventory.find({ $or: [{ user_id: req.user._id }, { user_id: req.user.main_account_id }] }).then(
                (inventory) => {
                  const approved = inventory.filter(function (obj) {
                    return obj.inventory_status === 'Approved';
                  });
                  console.log(approved.length);
                  res.send([
                    { name: 'zones', value: zones.length },
                    { name: 'locations', value: locations.length },
                    { name: 'users', value: users.length },
                    { name: 'inventories', value: inventory.length - approved.length },
                    { name: 'reports', value: approved.length },
                  ]);
                }
              );
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  } else if (user.role === 'Barman') {
    // TODO: make logic for the other roles
  }
};

exports.getLocations = (req, res) => {
  const { user } = req;
  if (user.role === 'Owner') {
    Location.find({ user_id: user._id })
      .then((locations) => {
        console.log('locations');
        res.send(locations);
      })
      .catch((err) => console.log(err));
  }
};

exports.getUsers = (req, res) => {
  const { _id } = req.user;
  User.find({ main_account_id: _id })
    .then((users) => {
      let i = 0;
      while (i < users.length) {
        users[i].password = undefined;
        users[i].tos = undefined;
        users[i].gdpr = undefined;
        users[i].resetToken = undefined;
        i++;
      }
      res.send(users);
    })
    .catch((err) => console.log(err));
};
exports.getAllUsers = (req, res) => {
  const { _id } = req.user;
  User.find({ $or: [{ _id }, { main_account_id: _id }] })
    .then((users) => {
      let i = 0;
      while (i < users.length) {
        users[i].password = undefined;
        users[i].tos = undefined;
        users[i].gdpr = undefined;
        users[i].resetToken = undefined;
        i++;
      }
      res.send(users);
    })
    .catch((err) => console.log(err));
};

exports.getInventoryByZoneId = (req, res) => {
  const { id } = req.body;
  Inventory.find({ zone_id: id })
    .populate('zone_id')
    .populate('user_id')
    .then((inventories) => {
      const finalInventory = inventories.filter(function (obj) {
        return obj.inventory_status === 'Approved';
      });
      res.send(finalInventory);
    })
    .catch((err) => console.log(err));
};

exports.getZonesByLocationId = (req, res) => {
  if (req.body.location_id) {
    Zone.find({ location_id: req.body.location_id })
      .then((zones) => {
        res.send(zones);
      })
      .catch((err) => console.log(err));
  } else {
    Zone.find({ $or: [{ account_id: req.user._id }, { account_id: req.user.main_account_id }] })
      .then((zones) => {
        res.send(zones);
      })
      .catch((err) => console.log(err));
  }
};

exports.getLocationsWithZones = async (req, res) => {
  const locationsWithZones = [];

  if (req.user.role === 'Owner' || req.user.role === 'Admin') {
    let locations = [];
    try {
      locations = await Location.find({ user_id: req.user._id });

      if (locations.length === 0) {
        res.send(locations);
      } else {
        for (let index = 0; index < locations.length; index++) {
          // console.log(locations[index], index)
          Zone.find({ location_id: locations[index]._id })
            .then((zones) => {
              const loc = {
                location_name: locations[index].location_name,
                id: locations[index]._id,
                zones,
              };
              locationsWithZones.push(loc);
              if (locationsWithZones.length === locations.length) {
                res.send(locationsWithZones);
              }
            })
            .catch((err) => console.log(err));
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log('getting to the else');
    // res.send(locationsWithZones);
    // TODO: make logic for the other rol
  }
};

exports.postZone = (req, res) => {
  // const user_id = req.user._id;
  // console.log(req.body)
  try {
    const { zone_name } = req.body;
    const { location_id } = req.body;
    const account_id = req.user._id;
    const zone = new Zone({
      zone_name,
      location_id,
      account_id,
    });
    return zone.save().then((zone) => res.status(200).send(zone));
  } catch (err) {
    return res.status(422).send(err.message);
  }
};

// exports.updateZoneUsers = async (req, res) => {
//   const { userList, zone_id } = req.body;

//   const newList = [];
//   const zone = await Zone.findById(zone_id);
//   console.log('zone users', zone.users);

//   userList.forEach((item, index) => {
//     newList[index] = { user_id: userList[index]._id };
//   });

//   console.log('userlist', userList);
//   console.log('newList', newList);
//   zone.users = newList;

//   try {
//     await zone.save();
//     return res.status(201);
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.addZoneUser = async (req, res) => {
  const { user, zone_id } = req.body;

  const zone = await Zone.findById(zone_id);

  const newUserList = [...zone.users, { user_id: user._id }];

  zone.users = newUserList;

  console.log(zone.users);

  try {
    await zone.save();
    return res.status(200).send(zone.users);
  } catch (err) {
    return res.status(422).send(err.message);
  }
};

exports.deleteZoneUser = async (req, res) => {
  const { user, zone_id } = req.body;

  const zone = await Zone.findById(zone_id);

  const users = zone.users.filter((zoneUser) => zoneUser.user_id.toString() !== user._id);

  try {
    zone.users = users;
    await zone.save();
    return res.status(200).send(zone.users);
  } catch (err) {
    return res.status(422).send(err.message);
  }
};

exports.getLocationUsers = async (req, res) => {
  const zone_id = req.body.id;
  const allUsers = [];
  const zone = await Zone.findById(zone_id).populate('users.user_id');
  const zoneUsers = [];

  if (zone.users.length > 0) {
    zone.users.forEach((user, index) => {
      console.log(zone.users[index]);
      const aUser = {
        _id: zone.users[index].user_id._id,
        first_name: zone.users[index].user_id.first_name,
        last_name: zone.users[index].user_id.last_name,
        email: zone.users[index].user_id.email,
        role: zone.users[index].user_id.role,
      };
      zoneUsers.push(aUser);
    });
  }

  const users = await User.find({ $or: [{ _id: req.user._id }, { main_account_id: req.user._id }] });

  users.forEach((anotherUser, index) => {
    const usr = {
      _id: users[index]._id,
      first_name: users[index].first_name,
      last_name: users[index].last_name,
      email: users[index].email,
      role: users[index].role,
    };
    allUsers.push(usr);
  });

  // the users who are not already assigned to the zone

  const getAvailableUsers = (a, b) => {
    if (b.length === 0) {
      return a;
    }

    for (let i = a.length - 1; i >= 0; i--) {
      b.forEach((second) => {
        if (a[i] !== undefined && second._id.toString() === a[i]._id.toString()) {
          a.splice(i, 1);
        }
      });
    }
    return a;
  };

  const availableUsers = getAvailableUsers(allUsers, zoneUsers);

  const data = {
    zone_id: zone._id,
    zone_name: zone.zone_name,
    zoneUsers,
    allUsers,
    availableUsers,
  };
  res.send(data);
};

exports.getZoneNameAndId = (req, res) => {
  const zone_id = req.body.id;
  Zone.findById(zone_id)
    .then((zone) => {
      res.send(zone);
    })
    .catch((err) => console.log(err));
};

exports.postEditZone = (req, res) => {
  const zone_id = req.body.id;
  const zone_name = req.body.location_name;
  Zone.findById(zone_id)
    .then((zone) => {
      zone.zone_name = zone_name;
      zone.save();
      return res.status(200).send('success');
    })
    .then((result) => {})
    .catch((err) => console.log(err));
};

exports.deleteZone = (req, res) => {
  const zone_id = req.body.id;
  Zone.deleteOne({ _id: zone_id })
    .then((response) => res.status(200).send('success'))
    .catch((err) => console.log(err));

  // DELETE THEIR INVENTORIES HERE! AND THEIR USERS
};

exports.getZone = async (req, res) => {
  const zone_id = req.body.id;
  const zone = await Zone.findById(zone_id).populate({
    path: 'products.product_id',
    model: Product,
    populate: {
      path: 'product_brand',
      model: Brand,
    },
  });

  if (zone) {
    res.status(200).send({ zone });
  }
};

exports.getZoneProducts = async (req, res) => {
  const { search } = req.body;

  const products = await Product.find({ $text: { $search: search } }).populate({ path: 'product_brand', model: Brand });

  res.status(200).send({ products });
};

exports.getAllProducts = (req, res) => {
  Product.find()
    .then((products) => res.status(200).send(products))
    .catch((err) => console.log(err));
};

exports.addProductToZone = async (req, res) => {
  const { zone_id } = req.body;
  const product_id = req.body.prod_id;

  const aZone = await Zone.findById(zone_id).populate({
    path: 'products.product_id',
    model: Product,
    populate: {
      path: 'product_brand',
      model: Brand,
    },
  });

  aZone.products.push({ product_id });
  await aZone.save();

  const zone = await Zone.findById(zone_id).populate({
    path: 'products.product_id',
    model: Product,
    populate: {
      path: 'product_brand',
      model: Brand,
    },
  });

  res.status(200).send({ zone });
};

exports.removeProductFromZone = async (req, res) => {
  const { zone_id } = req.body;
  const product_id = req.body.prod_id;

  const zone = await Zone.findById(zone_id).populate({
    path: 'products.product_id',
    model: Product,
    populate: {
      path: 'product_brand',
      model: Brand,
    },
  });

  const newProducts = zone.products.filter(function (product) {
    return product._id.toString() !== product_id;
  });

  console.log(newProducts.length);

  zone.products = newProducts;

  await zone.save(function (err, doc) {
    if (err) return console.error(err);
    console.log('Document inserted succussfully!');
  });

  console.log(zone);

  // const zone = await Zone.findById(zone_id).populate({
  //   path: 'products.product_id',
  //   model: Product,
  //   populate: {
  //     path: 'product_brand',
  //     model: Brand,
  //   },
  // });

  res.status(200).send({ zone });
};

exports.changeZoneProductsOrder = async (req, res) => {
  const { zoneId } = req.body;
  const { productList } = req.body;

  const oldZone = await Zone.findById(zoneId).populate({
    path: 'products.product_id',
    model: Product,
    populate: {
      path: 'product_brand',
      model: Brand,
    },
  });

  oldZone.products = productList;

  await oldZone.save();

  const zone = await Zone.findById(zoneId).populate({
    path: 'products.product_id',
    model: Product,
    populate: {
      path: 'product_brand',
      model: Brand,
    },
  });

  res.status(200).send({ zone });
};

exports.saveUsers = (req, res) => {
  const allUsers = [];
  const { first_name, last_name, email, role } = req.body;
  const user = new User({
    first_name,
    last_name,
    email,
    main_account_id: req.user._id,
    role,
    active: true,
    complete: false,
  });
  user
    .save()
    
    
    .then((result)=> {
      sgMail
      .send({
        to: req.body.email,
        from: env.EMAIL,
        subject: 'Welcome to Last Drop',
        text: `${req.body.first_name} ${req.body.last_name}`,
        html: '<strong>hello from last drop</strong>'
      })
       res.status(200).send(user)
      .catch((err) => console.log(err));
    })  
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err.errmsg });
    });
};//we can make a new function for sending mail

exports.deleteUser = (req, res) => {
  const { id } = req.body;
  User.deleteOne({ _id: id })
    .then((result) => {
      res.status(200);
    })
    .catch((err) => console.log(err));
};

exports.setLocation = (req, res) => {
  const { location_name } = req.body;
  const { _id } = req.user;
  console.log('asd');
  const location = new Location({
    location_name,
    user_id: _id,
  });

  location
    .save()
    .then((val) => {
      res.status(200).send(val);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

exports.completeAccount = (req, res) => {
  try {
    const { zone_name } = req.body;
    const { location_id } = req.body;
    const account_id = req.user._id;
    const zone = new Zone({
      zone_name,
      location_id,
      account_id,
    });
    return zone.save().then((zone) => {
      User.findById(account_id)
        .then((user) => {
          user.complete = true;
          user.save().then((user) => res.status(200).send(zone));
        })
        .catch((err) => console.log(err));
    });
  } catch (err) {
    return res.status(422).send(err.message);
  }
};

exports.editUser = (req, res) => {
  const { first_name, last_name,role, email, _id } = req.body;
  User.findById(_id)
    .then((user) => {
      if (first_name !== '') {
        user.first_name = first_name;
      }
      if (last_name !== '') {
        user.last_name = last_name;
      }
      if (email !== '') {
        user.email = email;
      }
      if (role !==''){
        user.role=role;
      }
      user
        .save()
        .then((result) => res.status(201).send(result))
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getAllLocations = (req, res) => {
  Location.find({ $or: [{ user_id: req.user._id }, { user_id: req.user.main_account_id }] })
    .then((locations) => res.status(201).send(locations))
    .catch((err) => console.log(err));
};

exports.postCompanyDetails = (req, res) => {
  console.log(req.body);
  const { address, bank, cif, iban, name, nr_reg_com } = req.body;
  User.findById(req.user._id)
    .then((user) => {
      user.company.address = address;
      user.company.name = name;
      user.company.bank = bank;
      user.company.cif = cif;
      user.company.iban = iban;
      user.company.nr_reg_com = nr_reg_com;
      user
        .save()
        .then((result) => res.send({ code: 200 }))
        // Trimite eroarea catre user
        .catch((err) =>
          res.send({
            error:
              'Platforma a intampinat o eroare, te rugam sa reincerci. Daca problema persista, te rugam sa contactezi departamentul support',
          })
        );
    })
    .catch();
};

exports.getNotifications = (req, res) => res.send({});

exports.getInfo = (req, res) => res.send({});
exports.getUserData = (req, res) => {
  const { user } = req;
  user.password = undefined;
  user.tos = undefined;
  user.gdpr = undefined;
  user.resetToken = undefined;
  return res.send(user);
};

exports.updateCompanyDetails = (req, res) => {
  const { _id } = req.user;
  const { name, address, cif, nr_reg_com, bank, iban } = req.body;
  User.findById(_id)
    .then((user) => {
      user.company.name = name;
      user.company.address = address;
      user.company.cif = cif;
      user.company.nr_reg_com = nr_reg_com;
      user.company.bank = bank;
      user.company.iban = iban;
      user
        .save()
        .then((result) => res.status('201').send({}))
        .catch((err) => {
          console.log(err);
          return res.status('500').send({});
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status('500').send({});
    });
};

exports.updateUserDetails = (req, res) => {
  const { _id } = req.user;
  const { first_name, last_name, email } = req.body;
  User.findById(_id).then((user) => {
    if (first_name !== '') {
      user.first_name = first_name;
    }
    if (last_name !== '') {
      user.last_name = last_name;
    }
    if (email !== '') {
      user.email = email;
    }
    user
      .save()
      .then((result) => res.status('201').send({}))
      .catch((err) => {
        console.log(err);
        return res.status('500').send({});
      });
  })``.catch((err) => {
    console.log(err);
    return res.status('500').send({});
  });
};

exports.changePassword = (req, res) => {
  const { _id } = req.user;
  const { newPassword, oldPassword } = req.body;
  console.log(newPassword);
  User.findById(_id)
    .then((user) => {
      user.comparePassword(oldPassword).then((result) => {
        if (result === true) {
          user.password = newPassword;
          user.save().then((result) => res.status('201').send({}));
        }
      });
    })
    .catch((err) => console.log(err));
};
// returns the date to use on IOS
exports.getDate = (req, res) => {
  const date = new Date();

  const today = date.toLocaleDateString('ro-RO');
  const dateArray = today.split('.');
  const month = [
    'ianuarie',
    'februarie',
    'martie',
    'aprilie',
    'mai',
    'iunie',
    'iulie',
    'august',
    'septembrie',
    'octombrie',
    'noiembrie',
    'decembrie',
  ];
  const d = `${dateArray[0]} ${month[parseInt(dateArray[1]) - 1]} ${date.getFullYear()}`;
  return res.status('200').send(d);
};

exports.getCurrentUserData = (req, res) => {
  const [user] = req;
  if (user.role === 'Owner') {
    const u = {
      first_name: user.first_name,
      last_mame: user.last_name,
      company: user.company.name,
      role: user.role,
    };
    return res.status('200').send({ u });
  }
  User.findById(user.main_account_id).then((user) => {
    const u = {
      first_name: user.first_name,
      last_mame: user.last_name,
      company: user.company.name,
      role: user.role,
    };
    return res.status('200').send({ u });
  });
};

exports.submitFirstStep = (req, res) => {
  // const [company_name, nr_reg_com, address, cif, step] = req.body
  const { company_name } = req.body;
  const { nr_reg_com } = req.body;
  const { cif } = req.body;
  const { address } = req.body;
  const { step } = req.body;
  User.findById(req.user._id)
    .then((user) => {
      user.company.name = company_name;
      user.company.cif = cif;
      user.company.nr_reg_com = nr_reg_com;
      user.company.address = address;
      user.step = step;
      user.save().then((result) => res.status('200').send({ code: 'ok' }));
    })
    .catch((err) => console.log(err));
};

exports.getUserDataHeader = (req, res) => res.status(200).send({ user: req.user });

exports.sendBankDetails = (req, res) => {
  const { bank } = req.body;
  const { iban } = req.body;
  User.findById(req.user._id)
    .then((user) => {
      user.company.bank = bank;
      user.company.iban = iban;
      user.step = 3;
      user.save().then((result) => res.status('200').send({ code: 'ok' }));
    })
    .catch((err) => console.log(err));
};

exports.sendFirstLocation = (req, res) => {
  const location_name = req.body.location;
  const user_id = req.user._id;
  Location.findOne({ user_id })
    .then((location) => {
      if (location) {
        location.location_name = location_name;
        location
          .save()
          .then((result) => {
            console.log(result);
            return res.status('200').send({ code: 'ok' });
          })
          .catch((err) => console.log(err));
      } else {
        const l = new Location({
          location_name,
          user_id,
        });
        l.save()
          .then((result) => res.status('200').send({ code: 'ok' }))
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};
exports.sendFirstZone = (req, res) => {
  const zone_name = req.body.zone;
  const user_id = req.user._id;
  // Search for the defined location
  Location.findOne({ user_id })
    .then((location) => {
      Zone.findOne({ account_id: user_id }).then((z) => {
        if (z) {
          z.zone_name = zone_name;
          z.save().then((result) => res.status('200').send({ code: 'ok' }));
        } else {
          const zone = new Zone({
            zone_name,
            account_id: user_id,
            location_id: location._id,
            users: [],
            products: [],
          });
          zone
            .save()
            .then((result) => {
              User.findById(user_id)
                .then((user) => {
                  user.complete = true;
                  user.save().then((result) => res.status('200').send({ code: 'ok' }));
                })
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        }
      });
    })
    .catch((err) => console.log(err));
};
