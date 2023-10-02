
module.exports = (sequelize, Sequelize) => {
    const Account  = require("./account.model.js")(sequelize,Sequelize);
    const Supplier = require("./supplier.model.js")(sequelize,Sequelize);
    const SupplierLogging = sequelize.define("supplierlogging",{
        supplier_id:{
            type:Sequelize.INTEGER,
            allowNull:false,
            references:{
                model:"suppliers",
                key:"id"
            }
        },
        supplier_code:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        logging_type:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        description:{
            type:Sequelize.ARRAY(Sequelize.STRING),
            allowNull:false,
        },
        createdBy:{
            type:Sequelize.INTEGER,
            allowNull:true,
            references:{
                model:"accounts",
                key:"id",
            }
        },
    });
    SupplierLogging.belongsTo(Account, {
        foreignKey:'createdBy'
    });
    SupplierLogging.belongsTo(Supplier, {
        foreignKey:'supplier_id'
    })

    return SupplierLogging;
};