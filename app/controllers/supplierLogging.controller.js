const db = require("../models");
const SupplierLog = db.supplierloggings;
const Op = db.Sequelize.Op;
const Sequelize = db.Sequelize
require("dotenv").config();
const { getPagination, getPagingData } = require("../utils/util");

const Logging = require("./logging.controller.js");

const Account = db.accounts;

// Retrieve all Supplier logs from the database.
exports.findAll = async (req, res) => {
  const { id } = req.params;
  SupplierLog.findAll({ where: { supplier_id: id },  order: [['createdAt', 'DESC']]})
    .then(async (data) => {
      var finalsupplierlogs = [];
      for (let supplierlog of data) {
        if (supplierlog.dataValues.createdBy !== null) {
          var sup = await Account.findByPk(supplierlog.dataValues.createdBy);
          supplierlog.createdByEmail = sup.email;
        }
        supplierlog.dataValues.createdByEmail = supplierlog.createdByEmail;
        finalsupplierlogs.push(supplierlog);
      }
      res.send(finalsupplierlogs);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving supplier's logs.",
      });
    });
};

// Delete a Supplier log with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  SupplierLog.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Supplier log was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Supplier log with id=${id}. Maybe Supplier log was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Supplier log with id=" + id,
      });
    });
};

// Delete all Supplier Logs from the database.
exports.deleteAll = (req, res) => {
  SupplierLog.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Supplier Logs were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all Supplier Logs.",
      });
    });
};
