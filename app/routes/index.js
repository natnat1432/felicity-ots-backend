module.exports = app =>{
    const authentication = require("../middlewares/authentication.js");
    const accounts = require("./account.routes.js");
    const loggings = require("./logging.routes.js")
    app.use('/api/accounts', accounts);
    app.use('/api/loggings',loggings);
    app.use('/api/auth', authentication);
}