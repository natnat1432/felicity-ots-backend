module.exports = (sequelize, Sequelize) => {
  const Account = require("./account.model.js")(sequelize, Sequelize);
  const FelicityMarketCompetitor = sequelize.define(
    "felicitymarketcompetitor",
    {
      market_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id",
        },
      },
    }
  );
  FelicityMarketCompetitor.belongsTo(Account, {
    foreignKey: "createdBy",
  });
  return FelicityMarketCompetitor;
};
