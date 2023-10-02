const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const { Op } = require("sequelize");
require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { sendEmail } = require("../utils/emailSender.js");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  port:dbConfig.PORT,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Loggings 
db.loggings = require("./logging.model.js")(sequelize,Sequelize);

//Tokens
db.tokens = require("./token.model.js")(sequelize,Sequelize);

//Accounts
db.accounts = require("./account.model.js")(sequelize, Sequelize);

//Suppliers
db.suppliers = require("./supplier.model.js")(sequelize, Sequelize);
db.supplierloggings = require("./supplierLogging.model.js")(sequelize, Sequelize);

//Felicity Product
db.felicityproducts = require("./felicityProduct.model.js")(sequelize,Sequelize);
db.felicityproductloggings = require("./felicityProductLogging.model.js")(sequelize,Sequelize);

//Felicity Price List
db.felicitycompetitors = require("./felicityCompetitor.model.js")(sequelize, Sequelize);
db.felicitypriceeffectivity = require("./felicityPriceEffectivity.model.js")(sequelize,Sequelize);
db.felicitypriceeffectivityloggings = require("./felicityPriceEffectivityLogging.model.js")(sequelize,Sequelize);
db.felicitypricelists = require("./felicityPricelist.model.js")(sequelize,Sequelize);

//Suleat Products
db.suleatproducts = require("./suleatProduct.model.js")(sequelize,Sequelize);
db.suleatproductloggings = require("./suleatProductLogging.model.js")(sequelize,Sequelize);

//Suleat Pricelist
db.suleatpricelists = require("./suleatPricelist.model.js")(sequelize,Sequelize);

const createMainSuperAdmin = async() =>{
  console.log("Checking main Superadmin account...")
  const email = process.env.SUPERADMIN_DEFAULT_EMAIL;
  const password = process.env.SUPERADMIN_DEFAULT_PASS;
  var hashedPassword;
  await bcrypt
      .hash(password, saltRounds)
      .then((hash) => {
          hashedPassword = hash
      })
      .catch((err) => console.error(err.message));
  
  const checkEmail = await db.accounts.findOne({where:{email:email}})
  const tabs = process.env.SUPERADMIN_DEFAULT_TABS.split(",")
  if(!checkEmail){
      console.log("Creating Main Superadmin account...")
      const create_superadmin = {
          email:email,
          firstname:process.env.SUPERADMIN_DEFAULT_FNAME,
          lastname:process.env.SUPERADMIN_DEFAULT_LNAME,
          password:hashedPassword,
          active:true,
          user_category:'Superadmin',
          system_category:'all',
          tabs:tabs,
          reset_password:false,
          createdBy:null,
      }
    // Save Account in the database
    db.accounts.create(create_superadmin)
    .then(async (data) => {
      const sendEm = await sendEmail(email, password);
      if (sendEm && data) {	
          console.log('Main Superadmin Account created successfully')
      } else {
          console.log("Error creating main superadmin account")
      }
    })
    .catch((err) => {
      console.log("Some error occured while creating main superadmin")
    });

  }
}
createMainSuperAdmin()
module.exports = db;





