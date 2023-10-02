module.exports = (sequelize, Sequelize) =>  {
    const Account  = require("./account.model.js")(sequelize,Sequelize);
    const SuleatProduct = require("./suleatProduct.model.js")(sequelize,Sequelize)
    const SuleatProductLogging = sequelize.define("suleatproductlogging",{
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
                model:"suleatproducts",
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

    SuleatProductLogging.belongsTo(SuleatProduct, {
        foreignKey:'product_id'
    })
    
    SuleatProductLogging.belongsTo(Account, {
        foreignKey:'createdBy'
    })


    return SuleatProductLogging;
}