const suleatproducts = require("../controllers/suleatProduct.controller.js");
const suleatproductloggings = require("../controllers/suleatProductLogging.controller.js")
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");

//Suleat Products Route
//------------------------------------------------------------------------

// Create a new Product
router.post("/", authenticateToken, suleatproducts.create);
  
// Retrieve all Products
// router.get("/", authenticateToken, suleatproducts.findAll);

// Retrieve all active Products
router.get("/active", authenticateToken, suleatproducts.findAllActive);

// Retrieve all inactive Products
router.get("/inactive", authenticateToken, suleatproducts.findAllInactive);

// Retrieve a single Product with id
router.get("/find/:id", authenticateToken, suleatproducts.findOne);

// Export active products to excel
router.get("/export/", authenticateToken, suleatproducts.exportExcel);

// Update an Product with id
router.put("/:id", authenticateToken, suleatproducts.update);

// Update an Product with id
router.put("/status/:id", authenticateToken, suleatproducts.updateStatus);

// Delete an Product with id
router.delete("/:id", authenticateToken, suleatproducts.delete);

// Create a new Product
router.delete("/", authenticateToken, suleatproducts.deleteAll);


//Felicity Product Logs Route
//------------------------------------------------------------------------

  
// Retrieve all Product Logs
router.get("/logs/:id", authenticateToken, suleatproductloggings.findAll);

module.exports = router;



