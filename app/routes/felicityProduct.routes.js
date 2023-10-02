const felicityproducts = require("../controllers/felicityProduct.controller.js");
const felicityproductloggings = require("../controllers/felicityProductLogging.controller.js");

const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");

//Felicity Products Route
//------------------------------------------------------------------------

// Create a new Product
router.post("/", authenticateToken, felicityproducts.create);
  
// Retrieve all Products
router.get("/", authenticateToken, felicityproducts.findAll);

// Retrieve all active Products
router.get("/active", authenticateToken, felicityproducts.findAllActive);

// Retrieve all inactive Products
router.get("/inactive", authenticateToken, felicityproducts.findAllInactive);

// Export active products to excel
router.get("/export/", authenticateToken, felicityproducts.exportExcel);

// Retrieve a single Product with id
router.get("/find/:id", authenticateToken, felicityproducts.findOne);

// Update an Product with id
router.put("/:id", authenticateToken, felicityproducts.update);

// Update an Product with id
router.put("/status/:id", authenticateToken, felicityproducts.updateStatus);

// Delete an Product with id
router.delete("/:id", authenticateToken, felicityproducts.delete);

// Delete all Products
router.delete("/", authenticateToken, felicityproducts.deleteAll);


//Felicity Product Logs Route
//------------------------------------------------------------------------

  
// Retrieve all Product Logs
router.get("/logs/:id", authenticateToken, felicityproductloggings.findAll);

module.exports = router;



