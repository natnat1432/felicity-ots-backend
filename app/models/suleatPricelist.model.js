module.exports = (sequelize,Sequelize) =>{
    const Accounts = require("./account.model.js")(sequelize, Sequelize);
    const SuleatProduct = require("./suleatProduct.model.js")(sequelize,Sequelize);

    const SuleatPricelist = sequelize.define("suleatpricelists", {
        product_id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            references:{
                model:"suleatproducts",
                key:"id"
            }
        },
        item_price:{
            type:Sequelize.DECIMAL,
            allowNull:true,
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

    SuleatPricelist.belongsTo(SuleatProduct,{
        foreignKey:"product_id"
    });
    SuleatPricelist.belongsTo(Accounts,{
        foreignKey:"createdBy"
    });

    return SuleatPricelist;
}