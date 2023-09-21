
module.exports = (sequelize, Sequelize) => {
    const Account  = require("./account.model.js")(sequelize,Sequelize);
    const Logging = sequelize.define("logging",{
        description:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        account_id:{
            type:Sequelize.INTEGER,
            allowNull:true,
            references:{
                model:"accounts",
                key:"id",
            }
        },
    });
    Logging.belongsTo(Account, {
        foreignKey:'account_id'
    })
    
    return Logging;
};