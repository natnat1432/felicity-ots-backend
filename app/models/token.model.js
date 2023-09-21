
module.exports = (sequelize, Sequelize) => {
    const Account  = require("./account.model.js")(sequelize,Sequelize);
    const Token = sequelize.define("token",{
        refreshToken:{
            type:Sequelize.STRING,
            allowNull:false,
        },
        active:{
            type:Sequelize.BOOLEAN,
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
    Token.belongsTo(Account, {
        foreignKey:'account_id'
    })
    
    return Token;
};