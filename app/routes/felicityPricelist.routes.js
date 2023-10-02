const felicitypricelist = require("../controllers/felicityPricelist.controller.js");
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");


// Retrieve all Felicity Price Effectivity
router.get("/:id", authenticateToken, felicitypricelist.getPriceList);

// Export Excel Price Effectivity
router.get("/export/:id",authenticateToken,felicitypricelist.exportExcel);


// Update a Felicity Price Effectivity with id
router.put("/:id", authenticateToken, felicitypricelist.update);


// Retrieve a Felicity price effectivity
// router.get("/find/:id", authenticateToken, felicitypricelist.);




module.exports = router;