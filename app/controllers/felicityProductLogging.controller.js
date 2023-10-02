const db = require("../models");
const FelicityProductLog = db.felicityproductloggings;
const Account = db.accounts
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize
const { getPagination, getPagingData } = require("../utils/util");

const Logging = require("./logging.controller.js");


// Retrieve all Product logs from the database.
exports.findAll = async (req, res) => {
  const { id } = req.params;
  FelicityProductLog.findAll({ where: { product_id: id }, order: [['createdAt', 'DESC']]})
    .then(async (data) => {
      var finalproductlogs = [];
      for (let productlog of data) {
        if (productlog.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(productlog.dataValues.createdBy);
          productlog.createdByEmail = sup.email;
        }
        productlog.dataValues.createdByEmail = productlog.createdByEmail;
        finalproductlogs.push(productlog);
      }
      res.send(finalproductlogs);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving product's logs.",
      });
    });
};