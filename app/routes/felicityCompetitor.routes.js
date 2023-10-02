const felicitycompetitors = require("../controllers/felicityCompetitor.controller");
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");


// Create a new Account
router.post("/", authenticateToken, felicitycompetitors.create);
  
// Retrieve all felicitycompetitors
router.get("/", authenticateToken, felicitycompetitors.findAll);

// Retrieve a single Account with id
router.get("/find/:id", authenticateToken, felicitycompetitors.findOne);

// Update an Account with id
router.put("/:id", authenticateToken, felicitycompetitors.update);

// Delete an Account with id
router.delete("/:id", authenticateToken, felicitycompetitors.delete);

// Create a new Account
router.delete("/", authenticateToken, felicitycompetitors.deleteAll);


module.exports = router;