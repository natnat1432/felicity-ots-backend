const suleatpricelist = require("../controllers/suleatPricelist.controller");
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");



// Retrieve all Suleat Price Effectivity
router.get("/", authenticateToken, suleatpricelist.findAll);

// Retrieve Suleat Price Effectivity History
router.get("/history/:id", authenticateToken, suleatpricelist.getHistory);

// Export Excel Price List
router.get("/export",authenticateToken,suleatpricelist.exportExcel);

// Add product to price list
router.post("/", authenticateToken, suleatpricelist.create)

//Update a Felicity Produce Price
router.post("/update", authenticateToken, suleatpricelist.update)

// Update a Felicity Price Effectivity with id
// router.put("/:id", authenticateToken, suleatpricelist.update);






module.exports = router;