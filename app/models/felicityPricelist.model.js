module.exports = (sequelize, Sequelize) => {
  const Accounts = require("./account.model.js")(sequelize, Sequelize);
  const FelicityPriceEffectivity = require("./felicityPriceEffectivity.model.js")(sequelize, Sequelize);
  const FelicityProduct = require("./felicityProduct.model.js")(sequelize,Sequelize);
  const Supplier = require("./supplier.model.js")(sequelize, Sequelize);
  const FelicityPriceList =  sequelize.define("felicitypricelists", {
    price_effectivity_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "felicitypriceeffectivities",
        key: "id",
      },  
    },
    product_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "felicityproducts",
        key: "id",
      },
    },
    purchasing_price: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },

    supplier_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { 
        model: "suppliers",
        key: "id",
      },
    },
    supplier_code: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    standard_price_percent: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    standard_price: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    premium_price_percent: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    premium_price: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    competitor_one: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    competitor_one_price: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    competitor_two: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    competitor_two_price: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    competitor_three: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    competitor_three_price: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    createdBy:{
      type:Sequelize.INTEGER,
      allowNull:true,
      references:{
        model:"accounts",
        key:"id"
      }
    }
  });

  FelicityPriceList.belongsTo(FelicityPriceEffectivity, {
    foreignKey: "price_effectivity_id",
  });
  FelicityPriceList.belongsTo(Supplier, {
    foreignKey: "supplier_id",
  });
  FelicityPriceList.belongsTo(FelicityProduct, {
    foreignKey: "product_id",
  });
  FelicityPriceList.belongsTo(Accounts, {
    foreignKey: "createdBy",
  });


  return FelicityPriceList;
  // Product List Info
  // Effectivity Date
  // Purchasing Price
  // Supplier Code
  // Standard Price	// retail price
  // wholesale medium price
  // wholesale large (1m) price
  // wholesale large (3m) price
  // Premium Price
  // Competitor 1
  //     Name
  //     Price
  // Competitor 2
  //     Name
  //     Price
  // Competitor 3
  //     Name
  //     Price
};
