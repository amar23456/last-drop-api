const User = require('../models/UserModel');
const Zone = require('../models/ZonesModel');
const Product = require('../models/ProductModel');
const Inventory = require('../models/InventoryModel');
const helpers = require('../lib/helpers');
const Brand = require('../models/BrandModel');

exports.getUserZones = (req, res) => {
  const { authorisation } = req.headers;
  const { user } = req;
  if (user.role === 'Owner') {
    Zone.find({ account_id: user._id })
      .then((zones) => {
        res.send(zones);
      })
      .catch((err) => console.log(err));
  }
};
exports.getZoneProducts = async (req, res) => {
  const { id } = req.body;

  const inventory = await Inventory.findOne({ zone_id: id, inventory_status: 'Started' });

  if (inventory) {
    if (inventory.products) {
      const zone = await Zone.findById(id).populate({
        path: 'products.product_id',
        model: Product,
        populate: {
          path: 'product_brand',
          model: Brand,
        },
      });

      const index = inventory.products.length;
      res.send([{ product: zone.products[index] }, { zone_id: id }, { inventory_id: inventory._id }]);
    } else {
      const zone = await Zone.findById(id).populate({
        path: 'products.product_id',
        model: Product,
        populate: {
          path: 'product_brand',
          model: Brand,
        },
      });
      res.send([{ product: zone.products[0] }, { zone_id: id }, { inventory_id: inventory._id }]);
    }
  } else {
    const zone = await Zone.findById(id).populate({
      path: 'products.product_id',
      model: Product,
      populate: {
        path: 'product_brand',
        model: Brand,
      },
    });

    const otherInventory = new Inventory({
      user_id: req.user._id,
      main_account: req.user.role === 'Owner' || req.user.role === 'Admin' ? req.user._id : req.user.main_account_id,
      inventory_status: 'Started',
      finished: 'false',
      subDate: Date.now(),
      zone_id: id,
    });
    await otherInventory.save();
    res.send([{ product: zone.products[0] }, { zone_id: id }, { inventory_id: otherInventory._id }]);
  }
};
// Get inventories
exports.getInventories = (req, res) => {
  Inventory
    // Query
    .find({ $or: [{ user_id: req.user._id }, { user_id: req.user.main_account_id }] })
    .populate('zone_id')
    .then((inventories) => {
      const approved = inventories.filter(function (obj) {
        return obj.inventory_status !== 'Approved';
      });
      res.send(approved);
    })
    .catch((err) => console.log(err));
};

exports.setStatus = (req, res) => {
  const { id, status } = req.body;
  Inventory.findById(id)
    .then((inventory) => {
      inventory.inventory_status = status;
      return inventory.save();
    })
    .then((result) => {
      console.log(result);
      return res.status(201).send('Success');
    })
    .catch((err) => res.status(500).send(err.message));
};

exports.getApprovedInventories = () => {};

// Get the data sent by the app and store it into the inventory then return the next product
exports.submitProductVolumeAndCount = (req, res) => {
  const { bottleCount } = req.body;
  console.log(bottleCount);
  const { bottleVolume } = req.body;
  const prod_id = req.body._id;
  const { user } = req;
  const product = {
    product_id: prod_id,
    volume: bottleVolume,
    bottleCount,
  };
  Inventory.findOne({ user_id: req.user._id, inventory_status: 'Started' })
    .then((inventory) => {
      // console.log(inventor)
      const { products } = inventory;
      products.push(product);
      inventory.products = products;
      return inventory.save();
    })
    .then((result) => {
      // console.log(result.products.length)
      // console.log(result.products[result.products.length-1])
      Zone.findById(result.zone_id)
        .populate('products.product_id')
        .then((zone) => {
          if (zone.products.length > result.products.length) {
            // Next product
            res.send([{ product: zone.products[result.products.length] }, { status: 'Started' }]);
          } else {
            Inventory.findOne({ user_id: req.user._id, inventory_status: 'Started' })
              .then((inventory) => {
                inventory.inventory_status = 'Finished';
                return inventory.save();
              })
              .then((result) => {
                res.send([{ key: 'works' }, { status: 'Finished' }]);
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
  // Return data
};

exports.getProductVolume = (req, res) => {
  // const pxToMm = req.totalHeight/
  const liquidVolumbodye = 0;

  Product.findById(req.body._id).then((product) => {
    // Move the math to a different function
    if (product.totalH && product.bodyH && product.bodyW && product.reductionH && product.neckH && product.neckW) {
      const pxToMm = product.totalH / req.body.totalHeight;
      // console.log(req.body.barHeight*pxToMm)
      // console.log(product.bodyH)
      if (req.body.barHeight * pxToMm <= product.bodyH) {
        const bodyF = product.product_formula_1;
        const t = bodyF
          .replace('pi', Math.PI)
          .replace(/r/g, product.bodyW / 2 - 5)
          .replace('h', req.body.barHeight * pxToMm);
        liquidVolume = (eval(t) / 1000).toFixed(2);
      }
      if (req.body.barHeight * pxToMm > product.bodyH) {
        const bodyF = product.product_formula_1;
        const bv = bodyF
          .replace('pi', Math.PI)
          .replace(/r/g, product.bodyW / 2 - 5)
          .replace('h', product.bodyH);
        // liquidVolume=(eval(bv)/10000).toFixed(2);?

        const reductionF = product.product_formula_2;
        const height = req.body.barHeight * pxToMm - product.bodyH;
        // console.log(req.body.barHeight*pxToMm - product.bodyH)
        const rv = reductionF
          .replace('pi', Math.PI)
          .replace(/r/g, product.bodyW / 2 - 13)
          .replace('h', height);
        // console.log(eval(rv)/10000)?
        console.log();
        liquidVolume = (eval(rv) / 1000 + eval(bv) / 1000).toFixed(2);
      }
      console.log(product.product_volume * 100);
      console.log(liquidVolume, product.product_volume * 100);
      if (liquidVolume > product.product_volume * 1000) {
        liquidVolume = product.product_volume * 1000;
      }
      res.send({ liquidVolume });
    }
  });
};

// Export the xls version of the inventory for approval
exports.getInventorySheet = (req, res) => {};
