module.exports = app =>{
    const authentication = require("../middlewares/authentication.js");
    const accounts = require("./account.routes.js");
    const loggings = require("./logging.routes.js");
    const suppliers = require("./supplier.routes.js");
    const felicityproducts = require("./felicityProduct.routes.js");
    const felicitycompetitors = require("./felicityCompetitor.routes.js");
    const felicitypriceeffectivity = require('./felicityPriceEffectivity.routes.js')
    const felicitypricelists = require("./felicityPricelist.routes.js");
    const suleatproducts = require("./suleatProduct.routes.js");
    const suleatpricelists = require("./suleatPriceList.routes.js");
    app.use('/api/accounts', accounts);
    app.use('/api/suppliers', suppliers);
    app.use('/api/products/felicity', felicityproducts);
    app.use('/api/products/felicity/competitors', felicitycompetitors);
    app.use('/api/products/felicity/priceeffecitivity', felicitypriceeffectivity); 
    app.use('/api/products/felicity/prices/', felicitypricelists);
    app.use('/api/products/suleat',suleatproducts);
    app.use('/api/products/suleat/prices/',suleatpricelists);
    app.use('/api/loggings',loggings);
    app.use('/api/auth', authentication);
}