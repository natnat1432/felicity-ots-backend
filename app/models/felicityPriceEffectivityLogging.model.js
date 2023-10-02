module.exports =  (sequelize, Sequelize) =>  {
    const Account = require("./account.model.js")(sequelize,Sequelize);
    const FelicityPriceEffectivity = require("./felicityPriceEffectivity.model.js")(sequelize, Sequelize);
    const FelicityPriceEffectivityLogging =  sequelize.define("felicitypriceeffectivityloggings",{
        logging_type:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        description:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        price_effectivity_id:{
            type:Sequelize.INTEGER,
            allowNull:false,    
            references:{
                model:"felicitypriceeffectivities",
                key:"id"
            }
        },
        createdBy:{
            type:Sequelize.INTEGER,
            allowNull:false,
            references:{
                model:"accounts",
                key:"id"
            }
        }
    });
    FelicityPriceEffectivityLogging.belongsTo(Account,{
        foreignKey:"createdBy"
    });
    FelicityPriceEffectivityLogging.belongsTo(FelicityPriceEffectivity, {
        foreignKey:"price_effectivity_id"
    });
    return FelicityPriceEffectivityLogging;
}