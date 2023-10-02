module.exports = (sequelize, Sequelize) => {
    const Account  = require("./account.model.js")(sequelize,Sequelize);
    const FelicityProduct = sequelize.define("felicityproduct", {
        item_code:{
            type:Sequelize.STRING,
            allowNull:true,
            unique:true,
        },
        item_type:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        item_name:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        item_category:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        item_brand:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        item_packaging_unit:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        item_quantity_per_unit:{
            type:Sequelize.DOUBLE,
            allowNull:true,
        },
        item_unit_measure:{
            type:Sequelize.STRING,
            allowNull:true,
        },
        active:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
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

    FelicityProduct.belongsTo(Account, {
        foreignKey:'createdBy'
    })
    
    return FelicityProduct;
  };
  