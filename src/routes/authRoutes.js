const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const mainController = require('../controllers/mainController');
const inventoryController = require('../controllers/inventoryController');
const accountController = require('../controllers/AccountController');
const reportsController = require('../controllers/ReportsController');
const requireAuth = require('../middleware/requireAuth');
const PushNotificationsController = require('../controllers/PushNotificationsController');
const neckLineController = require('../controllers/setBottleNeckLineController');
const subScriptionController = require('../controllers/subScriptionController');
const { sendMail } = require('../emails/sendMail');
const { postAddLocation } = require('../controllers/location');

router.get('/', (req, res) => res.send('hi'));

router.post('/signup', authController.postSignup);
router.post('/signin', authController.postSignin);

// TODO: => Split routes and methods between according router files and controllers
router.post('/saveLocation',requireAuth,postAddLocation);
// Dashboard data response
router.get('/dashboard', requireAuth, mainController.getDashboard);
// inventory/zones screen data
router.get('/inventory_zones', requireAuth, inventoryController.getUserZones);
// Inventory main inventory(returns a product object)
router.post('/inventory_products', requireAuth, inventoryController.getZoneProducts);
router.post('/productVolume', requireAuth, inventoryController.getProductVolume);
router.post('/submitProductVolumeAndCount', requireAuth, inventoryController.submitProductVolumeAndCount);
router.post('/getInventoriesList', requireAuth, inventoryController.getInventories);
router.post('/getAccountData', requireAuth, accountController.getAccountData);
router.post('/getLocationsWithZones', requireAuth, mainController.getLocationsWithZones);
router.post('/saveZone', requireAuth, mainController.postZone);
router.post('/getLocationUsers', requireAuth, mainController.getLocationUsers);
router.post('/getZoneName', requireAuth, mainController.getZoneNameAndId);
router.post('/postEditZone', requireAuth, mainController.postEditZone);
router.post('/postDeleteZone', requireAuth, mainController.deleteZone);
// Returns zone products inside the zone settings screen
router.post('/getZoneProducts', requireAuth, mainController.getZoneProducts);
router.post('/getZone', requireAuth, mainController.getZone);

router.post('/getAllProducts', requireAuth, mainController.getAllProducts);
router.post('/addProductToZone', requireAuth, mainController.addProductToZone);

// new
router.post('/removeProductFromZone', requireAuth, mainController.removeProductFromZone);

router.post('/changeZoneProductsOrder', requireAuth, mainController.changeZoneProductsOrder);
// router.post('/updateZoneUsers', requireAuth, mainController.updateZoneUsers);
router.post('/deleteZoneUser', requireAuth, mainController.deleteZoneUser);
router.post('/addZoneUser', requireAuth, mainController.addZoneUser);

router.post('/getInventoryByZoneId', requireAuth, mainController.getInventoryByZoneId);

// This gets opened in the browser so we need no require auth validation
router.get('/renderInventoryXLS/:inventoryId', reportsController.renderInventoryXLS);
router.get('/venue_summary/:inventoryId', reportsController.inventoryVenueSummaryXLS);
router.get('/purchase_order/:inventoryId', reportsController.inventoryPurchaseOrderXLS);

router.post('/invStatus', requireAuth, inventoryController.setStatus);
router.post('/getApprovedInventories', requireAuth, inventoryController.getApprovedInventories);
router.get('/getLocations', requireAuth, mainController.getLocations);
router.post('/getZonesByLocationId', requireAuth, mainController.getZonesByLocationId);

router.get('/push', PushNotificationsController.InventoryStatusNotifications);
router.post('/addPushNotificationsToken', requireAuth, PushNotificationsController.tokenStorage);
router.get('/getUsers', requireAuth, mainController.getUsers);
router.get('/getAllUsers', requireAuth, mainController.getAllUsers);
router.post('/saveUsers', requireAuth, mainController.saveUsers);
router.post('/deleteUser', requireAuth, mainController.deleteUser);
router.post('/setLocation', requireAuth, mainController.setLocation);
router.post('/completeAccount', requireAuth, mainController.completeAccount);
router.post('/editUser', requireAuth, mainController.editUser);
router.post('/getAllLocations', requireAuth, mainController.getAllLocations);
router.post('/postCompanyDetails', requireAuth, mainController.postCompanyDetails);
router.get('/getNotifications', requireAuth, mainController.getNotifications);
router.get('/getInfo', requireAuth, mainController.getInfo);
router.get('/getUserData', requireAuth, mainController.getUserData);
router.post('/updateCompanyDetails', requireAuth, mainController.updateCompanyDetails);
router.post('/updateUserDetails', requireAuth, mainController.updateUserDetails);
router.post('/changePassword', requireAuth, mainController.changePassword);
router.post('/getDate', requireAuth, mainController.getDate);
router.get('/getUserData', requireAuth, mainController.getCurrentUserData);
router.post('/submitFirstStep', requireAuth, mainController.submitFirstStep);
router.post('/getUserDataHeader', requireAuth, mainController.getUserDataHeader);
router.post('/sendBankDetails', requireAuth, mainController.sendBankDetails);
router.post('/sendFirstLocation', requireAuth, mainController.sendFirstLocation);
router.post('/sendFirstZone', requireAuth, mainController.sendFirstZone);

router.get('/nextBottleNeckProduct', requireAuth, neckLineController.getNextProduct);
router.post('/setNeckBottleLine', requireAuth, neckLineController.setNeckBottleLine);

router.get('/downloadInvoice/:userId', subScriptionController.downloadInvoice);

// TODO: On inventory.finish add a function that sends the notifications and emails to the owner ACC
// TODO: Check if any other user has to get notified on inventory(finish status)
module.exports = router;
