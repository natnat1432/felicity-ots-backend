const felicitypriceeffectivity = require("../controllers/felicityPriceEffectivity.controller");
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");


// Create a new Felicity price effectivity
router.post("/", authenticateToken, felicitypriceeffectivity.create);
  
// Retrieve all Felicity Price Effectivity
router.get("/", authenticateToken, felicitypriceeffectivity.findAll);

// Retrieve a Felicity price effectivity
router.get("/find/:id", authenticateToken, felicitypriceeffectivity.findOne);

// Update a Felicity Price Effectivity with id
router.put("/:id", authenticateToken, felicitypriceeffectivity.update);

// Delete a Felicity price effectivity with id
router.delete("/:id", authenticateToken, felicitypriceeffectivity.delete);

// Delete all price effectivities
router.delete("/", authenticateToken, felicitypriceeffectivity.deleteAll);


module.exports = router;