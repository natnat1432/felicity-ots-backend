const suppliers = require("../controllers/supplier.controller.js");
const supplierlogs = require("../controllers/supplierLogging.controller.js")
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");

//Supplier routes
//--------------------------------------------
// Create a new Supplier
router.post("/", authenticateToken, suppliers.create);
  
// Retrieve all Suppliers paginated
router.get("/", authenticateToken, suppliers.findAll);

//Retrieve all Suppliers
router.get("/all/", authenticateToken,suppliers.getAll);

//Retrieve all Suppliers
router.get("/category/:category", authenticateToken,suppliers.getByCategory);

// Retrieve a single Supplier with id
router.get("/find/:id", authenticateToken, suppliers.findOne);

// Update an Supplier with id
router.put("/:id", authenticateToken, suppliers.update);

// Delete an Supplier with id
router.delete("/:id", authenticateToken, suppliers.delete);

// Create a new Supplier
router.delete("/", authenticateToken, suppliers.deleteAll);

//Supplier log routes
//--------------------------------------------
// Retrieve all Suppliers
router.get("/logs/:id", authenticateToken, supplierlogs.findAll);


module.exports = router;