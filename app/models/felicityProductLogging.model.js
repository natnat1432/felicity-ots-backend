module.exports = (sequelize, Sequelize) =>  {
    const Account  = require("./account.model.js")(sequelize,Sequelize);
    const FelicityProduct = require("./felicityProduct.model.js")(sequelize,Sequelize)
    const FelicityProductLogging = sequelize.define("felicityproductlogging",{
        logging_type:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        description:{
            type:Sequelize.ARRAY(Sequelize.STRING),
            allowNull:true,
        },
        product_id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            references:{
                model:"felicityproducts",
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
    })

    FelicityProductLogging.belongsTo(FelicityProduct, {
        foreignKey:'product_id'
    })
    
    FelicityProductLogging.belongsTo(Account, {
        foreignKey:'createdBy'
    })


    return FelicityProductLogging;
}