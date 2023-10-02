module.exports = (sequelize, Sequelize) => {
  const Account = require("./account.model.js")(sequelize, Sequelize);
  const FelicityPriceEffectivity = sequelize.define("felicitypriceeffectivity",
    {
      start_effectivity_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_effectivity_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id",
        },
      },
    });

  FelicityPriceEffectivity.belongsTo(Account, {
    foreignKey: "createdBy",
  });
  return FelicityPriceEffectivity;
};
