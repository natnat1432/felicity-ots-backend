module.exports = (sequelize, Sequelize) => {

  const Account = sequelize.define("account", {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tabs: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    },
    department: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    user_category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    system_category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    reset_password:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  });

  return Account;
};
