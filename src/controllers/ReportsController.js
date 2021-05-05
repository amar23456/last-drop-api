/*
 * Controller used to serve excel files to the requester
 *
 * */

const xl = require('excel4node');
const Inventory = require('../models/InventoryModel');
const Brand = require('../models/BrandModel');
const Product = require('../models/ProductModel');
const Category = require('../models/CategoryModel');
const FirstSubCategory = require('../models/FirstSubCategoryModel');
const SecondSubCategory = require('../models/SecondSubCategoryModel');

// Product Code
// Product Name
// Container Size (mL)
// Distributor	Product
// Category - Tier 1	Product Category -
// Tier 2	Product Category -
// Tier 3	Selected Product Category
// Total Quantity On-Hand
// Main Bar Quantity
// Secondary Bar Quantity
// Total Servings On-Hand
// Par
// Need for Par

const createAllSheet = (jsonData) =>
  new Promise((resolve) => {
    // setup workbook and sheet
    const wb = new xl.Workbook({
      workbookView: {
        activeTab: 2,
      },
    });
    const options = {
      sheetFormat: {
        baseColWidth: 20,
      },
    };
    const ws = wb.addWorksheet('Sheet', options);

    // Add a title row
    const fillerRow = {
      fill: {
        type: 'pattern',
        patternType: 'darkUp',
        bgColor: 'aqua',
        fgColor: 'aqua',
      },
    };

    ws.cell(1, 1).string('Product Code');

    ws.cell(1, 2).string('Product Name');

    ws.cell(1, 3).string('Product Brand');

    ws.cell(1, 4).string('Product Category');

    ws.cell(1, 5).string('Product Sub Category');

    ws.cell(1, 6).string('Product Second Category');

    ws.cell(1, 7).string('Container Size (ml)');

    ws.cell(1, 8).string('Counted (full bottles)');

    ws.cell(1, 9).string('Fractions (ml)');

    ws.cell(2, 1).string('').style(fillerRow);
    ws.cell(2, 2).string('').style(fillerRow);
    ws.cell(2, 3).string('').style(fillerRow);
    ws.cell(2, 4).string('').style(fillerRow);
    ws.cell(2, 5).string('').style(fillerRow);
    ws.cell(2, 6).string('').style(fillerRow);
    ws.cell(2, 7).string('').style(fillerRow);
    ws.cell(2, 8).string('').style(fillerRow);
    ws.cell(2, 9).string('').style(fillerRow);

    // add data from json

    for (let i = 0; i < jsonData.length; i++) {
      const row = i + 3;

      ws.cell(row, 1).string(jsonData[i].product_id._id.toString());

      ws.cell(row, 2).string(jsonData[i].product_id.product_name);

      ws.cell(row, 3).string(jsonData[i].product_id.product_brand.brand_name);

      ws.cell(row, 4).string(jsonData[i].product_id.product_category.category_name);

      ws.cell(row, 5).string(jsonData[i].product_id.product_subcategory.category_name);

      ws.cell(row, 6).string(jsonData[i].product_id.product_second_subcategory.category_name);

      ws.cell(row, 7).number(parseInt(jsonData[i].product_id.product_volume));

      ws.cell(row, 8).number(jsonData[i].bottleCount);

      ws.cell(row, 9).number(jsonData[i].volume);
    }
    resolve(wb);
  });

const createVenueSummarySheet = (jsonData) =>
  new Promise((resolve) => {
    // setup workbook and sheet
    const wb = new xl.Workbook({
      workbookView: {
        activeTab: 2,
      },
    });
    const options = {
      sheetFormat: {
        baseColWidth: 20,
      },
    };
    const ws = wb.addWorksheet('Sheet', options);

    // Add a title row
    const fillerRow = {
      fill: {
        type: 'pattern',
        patternType: 'darkUp',
        bgColor: 'aqua',
        fgColor: 'aqua',
      },
    };

    ws.cell(1, 1).string('Product Name');

    ws.cell(1, 2).string('Product Category');

    ws.cell(1, 3).string('Container Size (ml)');

    ws.cell(1, 4).string('Counted (full bottles)');

    // ws.cell(1, 9).string('Fractions (ml)');

    ws.cell(2, 1).string('').style(fillerRow);
    ws.cell(2, 2).string('').style(fillerRow);
    ws.cell(2, 3).string('').style(fillerRow);
    ws.cell(2, 4).string('').style(fillerRow);
    // add data from json

    for (let i = 0; i < jsonData.length; i++) {
      const row = i + 3;

      ws.cell(row, 1).string(jsonData[i].product_id.product_name);

      ws.cell(row, 2).string(jsonData[i].product_id.product_second_subcategory.category_name);

      ws.cell(row, 3).number(parseInt(jsonData[i].product_id.product_volume));

      ws.cell(row, 4).number(jsonData[i].bottleCount);
    }
    resolve(wb);
  });

const createPurchaseOrderSheet = (jsonData) =>
  // product name
  // container size
  // distributor
  // Total Quantity On-Hand
  // par
  // need for par
  // product id
  new Promise((resolve) => {
    // setup workbook and sheet
    const wb = new xl.Workbook({
      workbookView: {
        activeTab: 2,
      },
    });
    const options = {
      sheetFormat: {
        baseColWidth: 20,
      },
    };
    const ws = wb.addWorksheet('Sheet', options);

    // Add a title row
    const fillerRow = {
      fill: {
        type: 'pattern',
        patternType: 'darkUp',
        bgColor: 'aqua',
        fgColor: 'aqua',
      },
    };

    ws.cell(1, 1).string('Product Name');

    ws.cell(1, 2).string('Container Size (ml)');

    ws.cell(1, 3).string('Distributor');

    ws.cell(1, 4).string('Counted (full bottles)');

    ws.cell(1, 5).string('Par');

    ws.cell(1, 6).string('need for par');

    ws.cell(1, 7).string('Product code');

    // ws.cell(1, 9).string('Fractions (ml)');

    ws.cell(2, 1).string('').style(fillerRow);
    ws.cell(2, 2).string('').style(fillerRow);
    ws.cell(2, 3).string('').style(fillerRow);
    ws.cell(2, 4).string('').style(fillerRow);
    ws.cell(2, 5).string('').style(fillerRow);
    ws.cell(2, 6).string('').style(fillerRow);
    ws.cell(2, 7).string('').style(fillerRow);

    // add data from json

    for (let i = 0; i < jsonData.length; i++) {
      const row = i + 3;

      ws.cell(row, 1).string(jsonData[i].product_id.product_name);

      ws.cell(row, 2).string(jsonData[i].product_id.product_volume.toString());

      ws.cell(row, 3).string('Distributor missing');

      ws.cell(row, 4).string(jsonData[i].bottleCount.toString());

      ws.cell(row, 5).string('par');

      ws.cell(row, 6).string('need for par');

      ws.cell(row, 7).string(jsonData[i].product_id._id.toString());
    }
    resolve(wb);
  });

exports.renderInventoryXLS = async (req, res) => {
  const { inventoryId } = req.params;

  const inventory = await Inventory.findById(inventoryId)
    .populate({
      path: 'products.product_id',
      model: Product,
      populate: [
        {
          path: 'product_brand',
          model: Brand,
        },
        {
          path: 'product_category',
          model: Category,
        },
        {
          path: 'product_subcategory',
          model: FirstSubCategory,
        },
        {
          path: 'product_second_subcategory',
          model: SecondSubCategory,
        },
      ],
    })
    .populate('zone_id');

  const jsonData = JSON.stringify(inventory.products);

  const file = await createAllSheet(inventory.products);
  const zoneName = inventory.zone_id.zone_name.replace(/ /g, '_');

  const fname = `Total_Report_${zoneName}_${inventory.subDate.toString().split(' ')[2]}_${
    inventory.subDate.toString().split(' ')[1]
  }_${inventory.subDate.toString().split(' ')[3]}`;

  file.write(`${fname}.xlsx`, res);
};

exports.inventoryVenueSummaryXLS = async (req, res) => {
  const { inventoryId } = req.params;

  const inventory = await Inventory.findById(inventoryId)
    .populate({
      path: 'products.product_id',
      model: Product,
      populate: [
        {
          path: 'product_brand',
          model: Brand,
        },
        {
          path: 'product_category',
          model: Category,
        },
        {
          path: 'product_subcategory',
          model: FirstSubCategory,
        },
        {
          path: 'product_second_subcategory',
          model: SecondSubCategory,
        },
      ],
    })
    .populate('zone_id');

  const jsonData = JSON.stringify(inventory.products);

  const file = await createVenueSummarySheet(inventory.products);

  const zoneName = inventory.zone_id.zone_name.replace(/ /g, '_');

  const fname = `Venue_Summary_${zoneName}_${inventory.subDate.toString().split(' ')[2]}_${
    inventory.subDate.toString().split(' ')[1]
  }_${inventory.subDate.toString().split(' ')[3]}`;

  file.write(`${fname}.xlsx`, res);
};

exports.inventoryPurchaseOrderXLS = async (req, res) => {
  const { inventoryId } = req.params;

  const inventory = await Inventory.findById(inventoryId)
    .populate({
      path: 'products.product_id',
      model: Product,
      populate: [
        {
          path: 'product_brand',
          model: Brand,
        },
        {
          path: 'product_category',
          model: Category,
        },
        {
          path: 'product_subcategory',
          model: FirstSubCategory,
        },
        {
          path: 'product_second_subcategory',
          model: SecondSubCategory,
        },
      ],
    })
    .populate('zone_id');

  const jsonData = JSON.stringify(inventory.products);

  const file = await createPurchaseOrderSheet(inventory.products);

  const zoneName = inventory.zone_id.zone_name.replace(/ /g, '_');

  const fname = `Purchase_Order_${zoneName}_${inventory.subDate.toString().split(' ')[2]}_${
    inventory.subDate.toString().split(' ')[1]
  }_${inventory.subDate.toString().split(' ')[3]}`;

  file.write(`${fname}.xlsx`, res);
};
