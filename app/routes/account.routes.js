const accounts = require("../controllers/account.controller.js");
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");


// Create a new Account
router.post("/", authenticateToken, accounts.create);
  
// Retrieve all Accounts
router.get("/", authenticateToken, accounts.findAll);

// Retrieve all active Accounts
router.get("/active", authenticateToken, accounts.findAllActive);

// Retrieve a single Account with id
router.get("/find/:id", authenticateToken, accounts.findOne);

// Update an Account with id
router.put("/:id", authenticateToken, accounts.update);

//Reset an Account password

router.put("/resetpassword/:id", authenticateToken, accounts.resetPassword)

// Delete an Account with id
router.delete("/:id", authenticateToken, accounts.delete);

// Create a new Account
router.delete("/", authenticateToken, accounts.deleteAll);


module.exports = router;