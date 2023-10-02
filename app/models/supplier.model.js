module.exports = (sequelize, Sequelize) => {
    const Account  = require("./account.model.js")(sequelize,Sequelize);
    
    const Supplier = sequelize.define("supplier", {
      code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      registered_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      landline: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      business_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_person: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_person_mobile: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      supply_category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdBy:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
            model:"accounts",
            key:"id",
        }
      }
    });
    Supplier.belongsTo(Account,{
        foreignKey:"createdBy",
    })
    
    return Supplier;
    };
    