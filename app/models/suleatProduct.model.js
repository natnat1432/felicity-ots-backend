module.exports = (sequelize, Sequelize) => {
    const Account = require("./account.model.js")(sequelize, Sequelize);
    const SuleatProduct = sequelize.define("suleatproduct", {
        item_code:{
            type:Sequelize.STRING,
            unique:true,
            allowNull:true,
        },
        item_name:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        item_category:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        item_packaging_unit:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        item_unit_measure:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        active:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
        },
        createdBy:{
            type:Sequelize.INTEGER,
            allowNull:false,
            references:{
                model:"accounts",
                id:"key"
            }
        }
    }); 

    SuleatProduct.belongsTo(Account,{
        foreignKey:"createdBy"
    });
    return SuleatProduct;
}