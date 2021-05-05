const Product = require('../models/ProductModel');
const Brand = require('../models/BrandModel');

// Fetch next product that is missing neckline value

exports.getNextProduct = async (req, res, next) => {
  let product;
  try {
    product = await Product.findOne({ product_neck_line: null }).populate({
      path: 'product_brand',
      model: Brand,
    });
    res.json(product);
    console.log('SENT');
  } catch (e) {
    throw new Error(e);
  }
};

exports.setNeckBottleLine = async (req, res, next) => {
  const { neckLine, _id } = req.body;

  let product;
  try {
    product = await Product.findById(_id);
    if (product) {
      product.product_neck_line = neckLine;
      try {
        await product.save();
        const nextProduct = await Product.findOne({ product_neck_line: null }).populate({
          path: 'product_brand',
          model: Brand,
        });
        res.json(nextProduct);
      } catch (e) {
        throw new Error(e);
      }
    }
  } catch (e) {
    throw new Error(e);
  }
};

exports.editNeckBottleLine = async (req, res, next) => {
  // const { _id } = req.body;
};
