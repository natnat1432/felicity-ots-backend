const loggings = require("../controllers/logging.controller.js");
const router = require("express").Router();
const {authenticateToken} = require("../controllers/token.controller.js");


// Retrieve logging with id
router.post("/", authenticateToken, loggings.createLogging);
router.get("/:account_id", authenticateToken, loggings.findAllAccount);
module.exports = router;